import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiDownload, FiCalendar, FiFileText } from 'react-icons/fi';
import { adminService } from '../../services';
import { Card, Button, Select, PageHeader } from '../../components/ui';
import toast from 'react-hot-toast';

type ReportType = 'daily' | 'weekly' | 'monthly' | 'yearly';
type ExportFormat = 'pdf' | 'excel';

const AdminReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState<string | null>(null);

  const reportTypes: { value: ReportType; label: string }[] = [
    { value: 'daily', label: 'Daily Report' },
    { value: 'weekly', label: 'Weekly Report' },
    { value: 'monthly', label: 'Monthly Report' },
    { value: 'yearly', label: 'Yearly Report' },
  ];

  const handleExport = async (type: ReportType, format: ExportFormat) => {
    setExportLoading(`${type}-${format}`);
    try {
      const blob = await adminService.exportReport(type, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report-${type}-${new Date().toISOString().split('T')[0]}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Report downloaded');
    } catch {
      toast.error('Failed to export report');
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <div>
      <PageHeader title="Reports" subtitle="Generate and export system reports" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((type) => (
          <Card key={type.value} className="hover:shadow-soft-lg transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <FiCalendar className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-secondary-900 dark:text-secondary-100">
                  {type.label}
                </h3>
                <p className="text-sm text-secondary-500">
                  Get {type.value} statistics and insights
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="primary"
                size="sm"
                icon={<FiDownload className="w-4 h-4" />}
                loading={exportLoading === `${type.value}-pdf`}
                onClick={() => handleExport(type.value, 'pdf')}
              >
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={<FiFileText className="w-4 h-4" />}
                loading={exportLoading === `${type.value}-excel`}
                onClick={() => handleExport(type.value, 'excel')}
              >
                Excel
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <h3 className="font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
          Report Contents
        </h3>
        <ul className="space-y-2 text-sm text-secondary-600 dark:text-secondary-400">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500" />
            Total invoices generated
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500" />
            Revenue breakdown
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500" />
            New customer registrations
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500" />
            Trial conversions
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary-500" />
            Active vs inactive customers
          </li>
        </ul>
      </Card>

      <Card className="mt-6 bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800">
        <p className="text-warning-700 dark:text-warning-300 text-sm">
          <strong>Note:</strong> Reports are generated based on all data in the system. Large date ranges may take longer to process.
        </p>
      </Card>
    </div>
  );
};

export default AdminReportsPage;
