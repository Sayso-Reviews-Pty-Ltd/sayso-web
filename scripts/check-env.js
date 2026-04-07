#!/usr/bin/env node

// Simple script to check if Supabase environment variables are set
console.log("🔍 Checking Supabase Environment Variables...\n");

const requiredVars = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"];

let allSet = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: Set`);
    if (varName === "NEXT_PUBLIC_SUPABASE_URL") {
      console.log(`   Value: ${value}`);
    } else if (varName === "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
      console.log(`   Value: ${value.substring(0, 20)}...`);
    }
  } else {
    console.log(`❌ ${varName}: Missing`);
    allSet = false;
  }
});

console.log("\n" + "=".repeat(50));

if (allSet) {
  console.log("🎉 All required environment variables are set!");
  console.log("✅ Your Supabase authentication should work correctly.");
  console.log("\n📝 Next steps:");
  console.log("1. Visit http://localhost:3001/test-supabase to test connection");
  console.log("2. Visit http://localhost:3001/test-auth to test authentication");
  console.log("3. Visit http://localhost:3001/register to create an account");
} else {
  console.log("⚠️  Some environment variables are missing!");
  console.log("\n📝 To fix this:");
  console.log("1. Make sure you have a .env file in your project root");
  console.log("2. Add the following variables to your .env file:");
  console.log("   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co");
  console.log("   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here");
  console.log("3. Restart your development server");
}

console.log("\n🔗 Get your Supabase credentials from: https://supabase.com/dashboard");
