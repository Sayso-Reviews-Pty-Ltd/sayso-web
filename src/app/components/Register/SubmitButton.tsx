"use client";

import React from "react";
import { Button } from "@/app/components/atoms/Button/Button";

interface SubmitButtonProps {
  disabled: boolean;
  isSubmitting: boolean;
  onSubmit: (e: React.SyntheticEvent) => void;
}

export default function SubmitButton({ disabled, isSubmitting, onSubmit }: SubmitButtonProps) {
  return (
    <div className="pt-4 flex justify-center">
      <div className="w-full">
        <Button
          type="submit"
          disabled={disabled}
          onClick={onSubmit as React.MouseEventHandler<HTMLButtonElement>}
          isLoading={isSubmitting}
          variant="danger"
          fullWidth
          style={{ fontFamily: '"Livvic", sans-serif', fontWeight: 600 }}
        >
          Create account
        </Button>
      </div>
    </div>
  );
}
