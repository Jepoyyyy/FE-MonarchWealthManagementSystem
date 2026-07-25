import { useState } from "react";
import { Pagination } from "~/shared/components/Pagination";
import { PageHeader } from "~/shared/components/PageHeader";

interface DemoScenario {
  name: string;
  totalPages: number;
  description: string;
}

const scenarios: DemoScenario[] = [
  { name: "Single Page", totalPages: 1, description: "Should hide pagination" },
  { name: "Two Pages", totalPages: 2, description: "No ellipsis needed" },
  { name: "Five Pages", totalPages: 5, description: "All pages visible, no ellipsis" },
  { name: "Ten Pages", totalPages: 10, description: "Shows sliding window with ellipsis" },
  { name: "Twenty Pages", totalPages: 20, description: "Large dataset with dynamic window" },
  { name: "Fifty Pages", totalPages: 50, description: "Very large dataset" },
];

function PaginationScenario({ scenario }: { scenario: DemoScenario }) {
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="border border-border rounded-lg p-6 bg-card">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-1">
          {scenario.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-2">
          {scenario.description}
        </p>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Current Page:</span> {currentPage + 1} of {scenario.totalPages}
        </div>
      </div>

      <div className="flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={scenario.totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Test buttons for edge cases */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setCurrentPage(0)}
          className="px-3 py-1 text-xs rounded bg-muted hover:bg-muted/80 text-foreground"
        >
          First
        </button>
        <button
          onClick={() => setCurrentPage(Math.floor(scenario.totalPages / 2))}
          className="px-3 py-1 text-xs rounded bg-muted hover:bg-muted/80 text-foreground"
        >
          Middle
        </button>
        <button
          onClick={() => setCurrentPage(scenario.totalPages - 1)}
          className="px-3 py-1 text-xs rounded bg-muted hover:bg-muted/80 text-foreground"
        >
          Last
        </button>
        <button
          onClick={() => setCurrentPage(-5)}
          className="px-3 py-1 text-xs rounded bg-destructive/10 hover:bg-destructive/20 text-destructive"
        >
          Test: Page -5
        </button>
        <button
          onClick={() => setCurrentPage(scenario.totalPages + 10)}
          className="px-3 py-1 text-xs rounded bg-destructive/10 hover:bg-destructive/20 text-destructive"
        >
          Test: Page {scenario.totalPages + 10}
        </button>
      </div>
    </div>
  );
}

export function PaginationDemo() {
  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Pagination Component Demo"
        subtitle="Testing limited range display with dynamic window and error handling"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h2 className="text-sm font-semibold text-foreground mb-2">
            Testing Instructions
          </h2>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Click page numbers to navigate</li>
            <li>Watch the window slide as you move through pages</li>
            <li>First and last pages always visible (when totalPages &gt; 7)</li>
            <li>Ellipsis (⋯) appears when there are gaps</li>
            <li>Test edge cases with the red buttons (negative pages, out-of-bounds)</li>
            <li>Verify Previous/Next buttons disable at boundaries</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((scenario) => (
            <PaginationScenario key={scenario.name} scenario={scenario} />
          ))}
        </div>

        <div className="mt-8 p-6 bg-card border border-border rounded-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Error Handling Tests
          </h3>
          <div className="space-y-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Test 1 - Negative Pages:</span>
              <p>Click "Test: Page -5" button. Should auto-correct to page 1 (index 0).</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Test 2 - Out of Bounds:</span>
              <p>Click the red out-of-bounds button. Should auto-correct to last page.</p>
            </div>
            <div>
              <span className="font-medium text-foreground">Test 3 - Window Movement:</span>
              <p>For 20 or 50 pages, click through sequentially to see sliding window.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
