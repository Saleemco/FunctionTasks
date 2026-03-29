import { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle, XCircle, Download } from 'lucide-react';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import toast from 'react-hot-toast';
import api from '../../services/api';

interface ExcelImportCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ImportResult {
  success: Array<{
    row: number;
    admissionNo: string;
    name: string;
    email: string;
    password: string;
    className: string;
    gender: string;
    category: string;
  }>;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
  total: number;
}

export const ExcelImportCustomModal = ({ isOpen, onClose, onSuccess }: ExcelImportCustomModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (fileExt !== 'xlsx' && fileExt !== 'xls') {
        toast.error('Please upload an Excel file (.xlsx or .xls)');
        return;
      }
      setFile(selectedFile);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/students/import-excel-custom', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data.results);
      
      if (response.data.results.success.length > 0) {
        toast.success(`Successfully imported ${response.data.results.success.length} students`);
        onSuccess();
      }
      
      if (response.data.results.errors.length > 0) {
        toast.error(`${response.data.results.errors.length} students failed to import`);
      }
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.response?.data?.error || 'Failed to import students');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      const response = await api.get('/students/import-template', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'student_import_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Template downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download template');
    }
  };

  const resetModal = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Import Students from Excel</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">Instructions:</h3>
            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
              <li>Your Excel file should have these columns in order:</li>
              <li className="ml-4">Column A: Admission Number (required)</li>
              <li className="ml-4">Column B: Surname (required)</li>
              <li className="ml-4">Column C: First Name (required)</li>
              <li className="ml-4">Column D: Other Name (optional)</li>
              <li className="ml-4">Column E: Gender (MALE/FEMALE)</li>
              <li className="ml-4">Column F: Class (JSS1, JSS2, JSS3, SSS1, SSS2, SSS3)</li>
              <li className="ml-4">Column G: Category (BOARDER/DAY)</li>
              <li>Class names will be automatically normalized (JSS1 → JSS 1, etc.)</li>
              <li>Email will be auto-generated: firstname.surname@school.edu</li>
              <li>Default password for all students: student123</li>
            </ul>
          </div>

          {/* Template Download */}
          <div>
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Download Excel Template</span>
            </button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-gray-600 mb-2">
              {file ? file.name : 'Click to select your Excel file'}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Supported formats: .xlsx, .xls
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Choose File
            </label>
          </div>

          {/* Import Results */}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-gray-700">Import Summary:</span>
                  <div className="mt-1 space-x-4">
                    <span className="text-sm text-green-600">
                      <CheckCircle className="inline w-4 h-4 mr-1" />
                      Success: {result.success.length}
                    </span>
                    <span className="text-sm text-red-600">
                      <XCircle className="inline w-4 h-4 mr-1" />
                      Errors: {result.errors.length}
                    </span>
                    <span className="text-sm text-gray-600">
                      Total: {result.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Success List */}
              {result.success.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Successfully Imported:</h4>
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Admission No</th>
                          <th className="px-3 py-2 text-left">Name</th>
                          <th className="px-3 py-2 text-left">Class</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {result.success.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-3 py-2 font-mono text-xs">{item.admissionNo}</td>
                            <td className="px-3 py-2">{item.name}</td>
                            <td className="px-3 py-2">{item.className}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Error List */}
              {result.errors.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-red-700 mb-2">Errors:</h4>
                  <div className="max-h-40 overflow-y-auto border border-red-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-red-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Row</th>
                          <th className="px-3 py-2 text-left">Error</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-red-100">
                        {result.errors.map((error, idx) => (
                          <tr key={idx} className="hover:bg-red-50">
                            <td className="px-3 py-2 font-mono text-xs">{error.row}</td>
                            <td className="px-3 py-2 text-red-600 text-xs">{error.error}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isUploading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpload}
              disabled={!file || isUploading}
              isLoading={isUploading}
            >
              {isUploading ? 'Importing...' : 'Import Students'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcelImportCustomModal;