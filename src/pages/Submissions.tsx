import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { useDataStore } from '../store/data';
import Card from '../components/Card';
import Tabs from '../components/Tabs';
import { formatDate, formatCurrencyEGP } from '../utils/format';
import { Download, FileText, Users } from 'lucide-react';

export default function Submissions() {
  const { user } = useAuthStore();
  const { partnerApplications, closedDeals } = useDataStore();
  const [activeTab, setActiveTab] = useState('applications');

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/apply" replace />;
  }

  const exportToCSV = (data: any[], filename: string, headers: string[]) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => 
        typeof row[header] === 'string' && row[header].includes(',') 
          ? `"${row[header]}"` 
          : row[header]
      ).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportApplications = () => {
    const headers = ['fullName', 'phoneNumber', 'companyName', 'salesAgentsCount', 'hasRegisteredPapers', 'createdAt'];
    exportToCSV(partnerApplications, 'partner-applications.csv', headers);
  };

  const exportDeals = () => {
    const headers = ['developerName', 'projectName', 'clientFullName', 'unitCode', 'dealValue', 'createdAt'];
    exportToCSV(closedDeals, 'closed-deals.csv', headers);
  };

  const ApplicationsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <Users className="w-5 h-5 mr-2" />
          Partner Applications ({partnerApplications.length})
        </h2>
        {partnerApplications.length > 0 && (
          <button onClick={exportApplications} className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        )}
      </div>

      {partnerApplications.length === 0 ? (
        <Card className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No partner applications submitted yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {partnerApplications
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((application) => (
              <Card key={application.id}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{application.fullName}</h3>
                    <p className="text-sm text-gray-600">{application.companyName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium">{application.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Sales Agents</p>
                    <p className="font-medium">{application.salesAgentsCount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Registered</p>
                    <p className="font-medium">
                      {application.hasRegisteredPapers ? 'Yes' : 'No'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(application.createdAt)}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );

  const DealsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center">
          <FileText className="w-5 h-5 mr-2" />
          Closed Deals ({closedDeals.length})
        </h2>
        {closedDeals.length > 0 && (
          <button onClick={exportDeals} className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        )}
      </div>

      {closedDeals.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No closed deals submitted yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {closedDeals
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map((deal) => (
              <Card key={deal.id}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{deal.projectName}</h3>
                      <p className="text-sm text-gray-600">{deal.developerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Client</p>
                      <p className="font-medium">{deal.clientFullName}</p>
                      <p className="text-xs text-gray-500">Unit: {deal.unitCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Deal Value</p>
                      <p className="font-bold text-green-600 text-lg">
                        {formatCurrencyEGP(deal.dealValue)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-gray-600">Sales Representative</p>
                      <p className="font-medium">{deal.developerSalesName}</p>
                      <p className="text-xs text-gray-500">{deal.developerPhone}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Submitted</p>
                        <p className="text-sm font-medium">{formatDate(deal.createdAt)}</p>
                      </div>
                      {deal.fileNames && deal.fileNames.length > 0 && (
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Attachments</p>
                          <p className="text-sm font-medium">{deal.fileNames.length} file(s)</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
        </div>
      )}
    </div>
  );

  const tabs = [
    {
      id: 'applications',
      label: 'Partner Applications',
      content: <ApplicationsTab />
    },
    {
      id: 'deals',
      label: 'Closed Deals', 
      content: <DealsTab />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Submissions</h1>
        <p className="text-gray-600">
          View and manage your partner applications and closed deals.
        </p>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </div>
  );
}
