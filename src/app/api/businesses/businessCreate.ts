import { NextResponse } from "next/server";
import type { getServerSupabase } from "@/app/lib/supabase/server";
import { getServiceSupabase } from "@/app/lib/admin";
import { SUBCATEGORY_SLUG_TO_LABEL } from "@/app/utils/subcategoryPlaceholders";
import { SUBCATEGORY_TO_INTEREST } from "@/app/lib/onboarding/subcategoryMapping";
import {
  resolveCanonicalCategorySlug,
  normalizeMainCategorySlug,
  getFallbackSubcategoryForMainCategory,
  findSimilarBusinesses,
} from "./route.utils";

export async function handleBusinessCreation(
  req: Request,
  supabase: Awaited<ReturnType<typeof getServerSupabase>>,
  user: { id: string }
): Promise<NextResponse> {
  // Parse request as FormData (to support file uploads, matching review pattern)
  const formData = await req.formData();
  const name = formData.get("name")?.toString();
  const description = formData.get("description")?.toString() || null;
  const legacyCategory = formData.get("category")?.toString() || null;
  const subcategory = formData.get("subcategory")?.toString() || null;
  const mainCategory = formData.get("mainCategory")?.toString() || null;
  const category = (subcategory || legacyCategory || "").trim();
  const businessType = formData.get("businessType")?.toString() || null;
  const location = formData.get("location")?.toString();
  const address = formData.get("address")?.toString() || null;
  const phone = formData.get("phone")?.toString() || null;
  const email = formData.get("email")?.toString() || null;
  const website = formData.get("website")?.toString() || null;
  const priceRange = formData.get("priceRange")?.toString() || "$$";
  const isChain = formData.get("isChain")?.toString() === "true";
  const hoursRaw = formData.get("hours")?.toString();
  const hours = hoursRaw ? JSON.parse(hoursRaw) : null;
  const latRaw = formData.get("lat")?.toString();
  const lat = latRaw ? parseFloat(latRaw) : null;
  const lngRaw = formData.get("lng")?.toString();
  const lng = lngRaw ? parseFloat(lngRaw) : null;

  const imageFiles = formData
    .getAll("images")
    .filter((file): file is File => file instanceof File && file.size > 0);

  // Validate required fields
  const missingFields: string[] = [];
  if (!name || name.trim().length === 0) {
    missingFields.push("Business name");
  }
  if (!category || category.trim().length === 0) {
    missingFields.push("Category");
  }
  if (businessType !== "online-only" && (!location || location.trim().length === 0)) {
    missingFields.push("Location");
  }

  if (missingFields.length > 0) {
    const fieldList =
      missingFields.length === 1
        ? missingFields[0]
        : missingFields.length === 2
          ? `${missingFields[0]} and ${missingFields[1]}`
          : `${missingFields.slice(0, -1).join(", ")}, and ${missingFields[missingFields.length - 1]}`;

    return NextResponse.json(
      {
        error: `Please provide ${fieldList.toLowerCase()}. These fields are required to create a business listing.`,
        missingFields,
        code: "MISSING_REQUIRED_FIELDS",
      },
      { status: 400 }
    );
  }

  const normalizedMainCategory = normalizeMainCategorySlug(mainCategory);
  const normalizedCategoryValue = category.trim().toLowerCase();
  const subcategoryIsOther = normalizedCategoryValue === "other";
  const categorySlug = subcategoryIsOther
    ? getFallbackSubcategoryForMainCategory(normalizedMainCategory || "miscellaneous")
    : resolveCanonicalCategorySlug(category);

  if (!categorySlug) {
    return NextResponse.json(
      {
        error:
          "There was an issue with the business category. Please select a valid category and try again.",
        code: "INVALID_CATEGORY",
        details: `Unrecognized category value: "${category}"`,
      },
      { status: 400 }
    );
  }

  // Validate against canonical DB taxonomy
  try {
    const serviceSupabase = getServiceSupabase();
    const { data: canonicalCategory, error: canonicalCategoryError } = await (
      serviceSupabase as any
    )
      .from("canonical_subcategory_slugs")
      .select("slug")
      .eq("slug", categorySlug)
      .maybeSingle();

    if (canonicalCategoryError) {
      console.warn(
        "[API] Unable to verify canonical_subcategory_slugs row:",
        canonicalCategoryError.message
      );
    } else if (!canonicalCategory) {
      return NextResponse.json(
        {
          error:
            "There was an issue with the business category. Please select a valid category and try again.",
          code: "INVALID_CATEGORY",
          details: `Category slug "${categorySlug}" does not exist in canonical_subcategory_slugs`,
        },
        { status: 400 }
      );
    }
  } catch (taxonomyError) {
    console.warn("[API] Canonical category pre-check skipped:", taxonomyError);
  }

  const derivedPrimaryCategory = SUBCATEGORY_TO_INTEREST[categorySlug] ?? null;
  const primaryCategorySlug = subcategoryIsOther
    ? normalizedMainCategory || "miscellaneous"
    : derivedPrimaryCategory || normalizedMainCategory || "miscellaneous";

  const normalizeBusinessName = (n: string): string => n.trim().replace(/\s+/g, " ").toLowerCase();

  // Duplicate check
  if (!isChain && name?.trim()) {
    const normalizedName = normalizeBusinessName(name);
    const serviceSupabase = getServiceSupabase();
    const { data: existingDuplicate, error: dupError } = await (serviceSupabase as any)
      .from("businesses")
      .select("id")
      .eq("normalized_name", normalizedName)
      .eq("is_chain", false)
      .neq("status", "rejected")
      .maybeSingle();

    if (dupError) {
      console.warn("[API] Duplicate name check error:", dupError);
    } else if (existingDuplicate) {
      return NextResponse.json(
        {
          error: "BUSINESS_ALREADY_EXISTS",
          message: "A business with this name already exists.",
          details: "If this is a franchise or chain location, please mark it as a chain.",
        },
        { status: 409 }
      );
    }
  }

  const generateSlug = (businessName: string): string => {
    return businessName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  let slug = generateSlug(name!);
  let slugSuffix = 1;
  let finalSlug = slug;

  while (true) {
    const { data: existing } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", finalSlug)
      .single();

    if (!existing) {
      break;
    }
    finalSlug = `${slug}-${slugSuffix}`;
    slugSuffix++;
  }

  const businessData: any = {
    name: name!.trim(),
    description: description?.trim() || null,
    primary_subcategory_slug: categorySlug,
    primary_subcategory_label:
      SUBCATEGORY_SLUG_TO_LABEL[categorySlug as keyof typeof SUBCATEGORY_SLUG_TO_LABEL] ?? null,
    primary_category_slug: primaryCategorySlug,
    location: location?.trim() || null,
    address: address?.trim() || null,
    phone: phone?.trim() || null,
    email: email?.trim() || null,
    website: website?.trim() || null,
    price_range: priceRange || "$$",
    hours: hours || null,
    owner_id: user.id,
    slug: finalSlug,
    verified: false,
    status: "pending_approval",
    is_hidden: true,
    is_chain: isChain,
    lat: lat || null,
    lng: lng || null,
  };

  const { data: newBusiness, error: insertError } = await supabase
    .from("businesses")
    .insert(businessData)
    .select()
    .single();

  if (insertError) {
    console.error("[API] Error creating business:", insertError);

    let errorMessage =
      "We couldn't create your business listing. Please check your information and try again.";
    let errorCode = "DATABASE_ERROR";

    if (
      insertError.code === "23505" ||
      insertError.message?.includes("duplicate") ||
      insertError.message?.includes("unique")
    ) {
      errorMessage = "A business with this name already exists.";
      errorCode = "BUSINESS_ALREADY_EXISTS";
    } else if (insertError.code === "23503" || insertError.message?.includes("foreign key")) {
      errorMessage =
        "There was an issue with the business category. Please select a valid category and try again.";
      errorCode = "INVALID_CATEGORY";
    } else if (insertError.message) {
      errorMessage = `Unable to save business: ${insertError.message}`;
    }

    const statusCode =
      errorCode === "INVALID_CATEGORY" ? 400 : errorCode === "BUSINESS_ALREADY_EXISTS" ? 409 : 500;

    const body =
      errorCode === "BUSINESS_ALREADY_EXISTS"
        ? {
            error: "BUSINESS_ALREADY_EXISTS",
            message: errorMessage,
            details: "If this is a franchise or chain location, please mark it as a chain.",
          }
        : { error: errorMessage, details: insertError.message, code: errorCode };

    return NextResponse.json(body, { status: statusCode });
  }

  // Create business_owners entry
  const { error: ownerError } = await supabase.from("business_owners").upsert(
    {
      business_id: newBusiness.id,
      user_id: user.id,
      role: "owner",
      verified_at: new Date().toISOString(),
    },
    {
      onConflict: "business_id,user_id",
    }
  );

  if (ownerError) {
    console.error("[API] Error creating business owner:", ownerError);
    await supabase.from("businesses").delete().eq("id", newBusiness.id);
    return NextResponse.json(
      { error: "Failed to assign ownership", details: ownerError.message },
      { status: 500 }
    );
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      role: "business_owner",
      account_role: "business_owner",
      account_type: "business",
      onboarding_step: "business_setup",
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (profileError) {
    console.error("[API] Error updating user profile to business_owner:", profileError);
  } else {
    console.log("[API] Successfully updated user profile to business_owner for user:", user.id);
  }

  // Handle image uploads server-side
  const uploadErrors: string[] = [];
  const uploadedImages: any[] = [];

  if (imageFiles.length > 0) {
    const maxImages = Math.min(imageFiles.length, 10);

    const { data: existingPrimary } = await supabase
      .from("business_images")
      .select("id")
      .eq("business_id", newBusiness.id)
      .eq("is_primary", true)
      .limit(1)
      .single();

    for (let i = 0; i < maxImages; i++) {
      const imageFile = imageFiles[i];

      try {
        const fileExt = imageFile.name.split(".").pop() || "jpg";
        const filePath = `${newBusiness.id}/${Date.now()}_${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("business_images")
          .upload(filePath, imageFile, {
            contentType: imageFile.type,
          });

        if (uploadError) {
          console.error("[API] Error uploading business image:", uploadError);
          uploadErrors.push(`Failed to upload image ${i + 1}: ${uploadError.message}`);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("business_images").getPublicUrl(filePath);

        const shouldBePrimary = i === 0 && !existingPrimary;

        const { data: imageRecord, error: imageError } = await supabase
          .from("business_images")
          .insert({
            business_id: newBusiness.id,
            url: publicUrl,
            type: shouldBePrimary ? "cover" : "gallery",
            sort_order: i,
            is_primary: shouldBePrimary,
          })
          .select("id, url, type, sort_order, is_primary, created_at")
          .single();

        if (!imageError && imageRecord) {
          uploadedImages.push(imageRecord);
        } else if (imageError) {
          console.error("[API] Error saving business image record:", imageError);
          uploadErrors.push(`Failed to save image ${i + 1} metadata`);
          await supabase.storage.from("business_images").remove([filePath]);
        }
      } catch (error) {
        console.error("[API] Error processing business image:", error);
        uploadErrors.push(`Failed to process image ${i + 1}`);
      }
    }
  }

  const similarBusinesses = await findSimilarBusinesses(
    supabase,
    categorySlug,
    name!,
    location,
    newBusiness.id,
    5
  );

  return NextResponse.json(
    {
      success: true,
      business: newBusiness,
      images: uploadedImages,
      message: "Business created successfully!",
      ...(uploadErrors.length > 0 && { uploadWarnings: uploadErrors }),
      ...(similarBusinesses.length > 0 && { similarBusinesses }),
    },
    { status: 201 }
  );
}
