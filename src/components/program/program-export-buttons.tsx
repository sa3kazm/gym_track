"use client";

import { Calendar, FileDown, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProgramExportButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" asChild>
        <a href="/api/program/export/ics" download="gym-program.ics">
          <Calendar className="h-4 w-4" />
          Календар (.ics)
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open("/program/print", "_blank")}
      >
        <Printer className="h-4 w-4" />
        PDF / Друк
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.open("/program/print", "_blank")}
      >
        <FileDown className="h-4 w-4" />
        Відкрити для збереження PDF
      </Button>
    </div>
  );
}
