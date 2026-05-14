import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  FileText, Archive, Sparkles, TrendingUp, Tag, Clock, Activity,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { useInsights } from '../hooks/useNotes';
import { getTagColor, formatDate, cn } from '../lib/utils';

const StatCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color?: string;
}> = ({ icon: Icon, label, value, sub, color = 'text-brand-500' }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center bg-[var(--bg-subtle)]', color)}>
        <Icon className="w-4.5 h-4.5 w-[18px] h-[18px]" />
      </div>
    </div>
    <div className="text-2xl font-bold text-[var(--text)] mb-0.5">{value}</div>
    <div className="text-sm text-[var(--text-muted)]">{label}</div>
    {sub && <div className="text-xs text-[var(--text-subtle)] mt-0.5">{sub}</div>}
  </div>
);

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="card px-3 py-2 text-xs shadow-lg">
        <div className="text-[var(--text-muted)] mb-0.5">{label}</div>
        <div className="font-semibold text-[var(--text)]">{payload[0].value} notes</div>
      </div>
    );
  }
  return null;
};

export const DashboardPage: React.FC = () => {
  const { data: insights, isLoading } = useInsights();

  if (isLoading) {
    return (
      <Layout>
        <div className="p-6 space-y-4">
          <div className="skeleton h-8 w-40" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </Layout>
    );
  }

  const chartData = insights?.dailyActivity?.map((d) => ({
    day: new Date(d.date).toLocaleDateString('en', { weekday: 'short' }),
    notes: d.count,
  })) || [];

  return (
    <Layout>
      <div className="h-full overflow-y-auto scrollbar-thin">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-8 animate-in">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Dashboard</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Your productivity insights at a glance</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={FileText}
              label="Active Notes"
              value={insights?.totalNotes ?? 0}
              color="text-brand-500"
            />
            <StatCard
              icon={Archive}
              label="Archived"
              value={insights?.archivedNotes ?? 0}
              color="text-orange-500"
            />
            <StatCard
              icon={TrendingUp}
              label="This Week"
              value={insights?.weeklyActivity ?? 0}
              sub="notes created"
              color="text-green-500"
            />
            <StatCard
              icon={Sparkles}
              label="AI Requests"
              value={insights?.aiUsageTotal ?? 0}
              sub="total AI uses"
              color="text-purple-500"
            />
          </div>

          {/* Chart & Tags row */}
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Activity chart */}
            <div className="lg:col-span-3 card p-5">
              <div className="flex items-center gap-2 mb-5">
                <Activity className="w-4 h-4 text-[var(--text-muted)]" />
                <h2 className="font-semibold text-[var(--text)] text-sm">Weekly Activity</h2>
              </div>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barSize={24}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: 'var(--text-muted)' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-subtle)' }} />
                  <Bar
                    dataKey="notes"
                    fill="var(--brand, #6272f5)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top tags */}
            <div className="lg:col-span-2 card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-[var(--text-muted)]" />
                <h2 className="font-semibold text-[var(--text)] text-sm">Top Tags</h2>
              </div>
              {insights?.topTags && insights.topTags.length > 0 ? (
                <div className="space-y-2">
                  {insights.topTags.map(({ tag, count }) => (
                    <div key={tag} className="flex items-center gap-2">
                      <span className={cn('badge text-xs flex-shrink-0', getTagColor(tag))}>
                        {tag}
                      </span>
                      <div className="flex-1 h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-400 dark:bg-brand-500 rounded-full transition-all"
                          style={{
                            width: `${(count / (insights.topTags[0]?.count || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs text-[var(--text-subtle)] w-4 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--text-subtle)] text-center py-8">
                  No tags yet. Add tags to your notes!
                </p>
              )}
            </div>
          </div>

          {/* Recent notes */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-[var(--text-muted)]" />
              <h2 className="font-semibold text-[var(--text)] text-sm">Recently Updated</h2>
            </div>
            {insights?.recentNotes && insights.recentNotes.length > 0 ? (
              <div className="space-y-2">
                {insights.recentNotes.map((note) => (
                  <div
                    key={note._id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[var(--text-subtle)] flex-shrink-0" />
                    <span className="flex-1 text-sm text-[var(--text)] truncate">{note.title}</span>
                    <div className="flex gap-1 flex-shrink-0">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className={cn('badge text-xs', getTagColor(tag))}>{tag}</span>
                      ))}
                    </div>
                    <span className="text-xs text-[var(--text-subtle)] flex-shrink-0">{formatDate(note.updatedAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-subtle)] text-center py-8">No recent notes</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
