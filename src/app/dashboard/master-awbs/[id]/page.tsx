'use client';

import { useParams, useRouter } from 'next/navigation';
import { ArrowLeftIcon, PlusIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useGetMasterAwbByIdQuery } from '@/store/api/masterAwbsApi';
import { useSearchHouseAwbsQuery } from '@/store/api/houseAwbsApi';
import { useState } from 'react';

export default function MasterAwbDetailPage() {
  const params = useParams();
  const router = useRouter();
  const masterAwbId = params.id as string;
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch Master AWB details
  const { data: masterAwbResponse, isLoading: masterAwbLoading, error: masterAwbError } = useGetMasterAwbByIdQuery(masterAwbId);
  const masterAwb = masterAwbResponse?.data;

  // Fetch House AWBs for this Master AWB
  const { data: houseAwbsResponse, isLoading: houseAwbsLoading } = useSearchHouseAwbsQuery({
    master_id: masterAwbId,
    page: currentPage,
    page_size: 10,
  });

  const houseAwbsData = houseAwbsResponse?.data as any;
  const houseAwbs = houseAwbsData?.data || [];
  const pagination = houseAwbsData || { total: 0, page: 1, page_size: 10, total_pages: 0 };

  if (masterAwbLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (masterAwbError || !masterAwb) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load Master AWB details</p>
        <button
          onClick={() => router.push('/dashboard/master-awbs')}
          className="mt-4 text-blue-600 hover:text-blue-800"
        >
          Back to Master AWBs
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-500">
        <button
          onClick={() => router.push('/dashboard/jobs')}
          className="hover:text-blue-600"
        >
          Jobs
        </button>
        <span>/</span>
        {masterAwb.job && (
          <>
            <button
              onClick={() => router.push(`/dashboard/jobs/${masterAwb.job_id}`)}
              className="hover:text-blue-600"
            >
              {masterAwb.job.job_number}
            </button>
            <span>/</span>
          </>
        )}
        <button
          onClick={() => router.push('/dashboard/master-awbs')}
          className="hover:text-blue-600"
        >
          Master AWBs
        </button>
        <span>/</span>
        <span className="text-gray-900 font-medium">{masterAwb.master_number}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => masterAwb.job_id 
              ? router.push(`/dashboard/jobs/${masterAwb.job_id}`)
              : router.push('/dashboard/master-awbs')
            }
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Master AWB Details</h1>
            <p className="text-sm text-gray-500 mt-1">{masterAwb.master_number}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => router.push(`/dashboard/master-awbs/${masterAwbId}/edit`)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Edit Master AWB
          </button>
          <button
            onClick={() => router.push(`/dashboard/house-awbs/create?masterAwbId=${masterAwbId}&jobId=${masterAwb.job_id}`)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create House AWB
          </button>
        </div>
      </div>

      {/* Master AWB Information Card */}
      <div className="card">
        <div className="border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Master AWB Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500">Master AWB Number</label>
            <p className="mt-1 text-sm text-gray-900">{masterAwb.master_number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Status</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              masterAwb.status === 'issued' ? 'bg-green-100 text-green-800' :
              masterAwb.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {masterAwb.status}
            </span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500">Issue Date</label>
            <p className="mt-1 text-sm text-gray-900">
              {new Date(masterAwb.issue_date).toLocaleDateString()}
            </p>
          </div>
          {masterAwb.job && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Job</label>
              <button
                onClick={() => router.push(`/dashboard/jobs/${masterAwb.job_id}`)}
                className="mt-1 text-sm text-blue-600 hover:text-blue-800"
              >
                {masterAwb.job.job_number}
              </button>
            </div>
          )}
          {masterAwb.carrier && (
            <div>
              <label className="block text-sm font-medium text-gray-500">Carrier</label>
              <p className="mt-1 text-sm text-gray-900">
                {masterAwb.carrier.name || masterAwb.carrier.code}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* House AWBs Section */}
      <div className="card">
        <div className="border-b border-gray-200 pb-4 mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">House AWBs</h2>
            <p className="text-sm text-gray-500 mt-1">
              All House Air Waybills associated with this Master AWB
            </p>
          </div>
          <button
            onClick={() => router.push(`/dashboard/house-awbs/create?masterAwbId=${masterAwbId}&jobId=${masterAwb.job_id}`)}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add House AWB
          </button>
        </div>

        {houseAwbsLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : houseAwbs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No House AWBs found for this Master AWB</p>
            <button
              onClick={() => router.push(`/dashboard/house-awbs/create?masterAwbId=${masterAwbId}&jobId=${masterAwb.job_id}`)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Create First House AWB
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      House AWB Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Shipper
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Consignee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Issue Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {houseAwbs.map((houseAwb: any) => (
                    <tr key={houseAwb.house_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {houseAwb.house_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {houseAwb.shipper?.name || houseAwb.shipper?.short_name || `ID: ${houseAwb.shipper_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {houseAwb.consignee?.name || houseAwb.consignee?.short_name || `ID: ${houseAwb.consignee_id}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(houseAwb.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          houseAwb.status === 'issued' ? 'bg-green-100 text-green-800' :
                          houseAwb.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {houseAwb.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => router.push(`/dashboard/house-awbs/${houseAwb.house_id}`)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-5 w-5 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {houseAwbs.length > 0 && pagination.total_pages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
            <div className="text-sm text-gray-700">
              Showing page {pagination.page} of {pagination.total_pages} ({pagination.total} total)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(pagination.total_pages, currentPage + 1))}
                disabled={currentPage === pagination.total_pages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

