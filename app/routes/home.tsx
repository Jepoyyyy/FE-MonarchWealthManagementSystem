import type { Route } from "./+types/home";
import { Wallet, TrendingUp, Layers, DollarSign, Plus, ArrowRight } from "lucide-react";
import { StatCard } from "~/components/ui/StatCard";
import { Btn } from "~/components/ui/Btn";
import { Badge } from "~/components/ui/Badge";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard | Monarch WMS" },
    { name: "description", content: "Monarch Wealth Management System Dashboard" },
  ];
}

export default function Home() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <Badge variant="default">Demo View</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Welcome to Monarch Wealth Management System.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Btn variant="secondary" size="sm">
            Export Report
          </Btn>
          <Btn variant="primary" size="sm">
            <Plus className="w-4 h-4" />
            Add Asset
          </Btn>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard title="Total Assets" value={1000000} unit="currency" icon={Wallet} />
        <StatCard title="Return Rate" value={8.5} unit="percent" icon={TrendingUp} />
        <StatCard title="Holdings" value={12} unit="count" icon={Layers} />
        <StatCard title="Custom Value" value="Rp 5.000.000" icon={DollarSign} />
      </div>

      {/* UI Primitives Test Area */}
      <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Button Variants</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Btn variant="primary">Primary</Btn>
            <Btn variant="secondary">Secondary</Btn>
            <Btn variant="accent">Accent</Btn>
            <Btn variant="danger">Danger</Btn>
            <Btn variant="ghost">Ghost</Btn>
            <Btn variant="primary" disabled>Disabled</Btn>
            <Btn variant="primary">
              Continue <ArrowRight className="w-4 h-4" />
            </Btn>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Badge Variants</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Moderate Risk</Badge>
            <Badge variant="destructive">High Priority</Badge>
            <Badge variant="outline">Draft</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
