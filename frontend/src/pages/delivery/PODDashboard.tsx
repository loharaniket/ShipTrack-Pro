import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { FileCheck, AlertTriangle, Eye, Check, X } from 'lucide-react';

export function PODDashboard() {
  const [submissions, setSubmissions] = useState([
    { id: 'STP-10482', rec: 'Ramesh Singh', t: '10 mins ago', d: 'Rahul Sharma', stat: 'Pending' },
    { id: 'STP-10483', rec: 'Priya Patel', t: '25 mins ago', d: 'Arjun Mehta', stat: 'Verified' },
    { id: 'STP-10484', rec: 'Unknown', t: '1 hour ago', d: 'Neha Kapoor', stat: 'Rejected' },
    { id: 'STP-10485', rec: 'Vikram Gupta', t: '2 hours ago', d: 'Sanjay Mishra', stat: 'Verified' },
  ]);

  const pendingList = submissions.filter(s => s.stat === 'Pending');
  const [selectedPreview, setSelectedPreview] = useState(pendingList.length > 0 ? pendingList[0] : null);

  const handleUpdateStatus = (id: string, newStat: string) => {
    const updated = submissions.map(s => s.id === id ? { ...s, stat: newStat } : s);
    setSubmissions(updated);
    
    // Auto-select next pending if current was selected
    if (selectedPreview && selectedPreview.id === id) {
      const nextPending = updated.find(s => s.stat === 'Pending');
      setSelectedPreview(nextPending || null);
    }
  };

  const pendingCount = submissions.filter(s => s.stat === 'Pending').length;
  const verifiedCount = submissions.filter(s => s.stat === 'Verified').length;
  const rejectedCount = submissions.filter(s => s.stat === 'Rejected').length;
  const totalProcessed = verifiedCount + rejectedCount;
  const verifyRate = totalProcessed > 0 ? ((verifiedCount / totalProcessed) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-navy-900">Proof of Delivery</h1>
          <p className="text-navy-500 mt-1">Verify and manage delivery confirmations</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-24">
            <p className="text-sm font-medium text-navy-500">Pending Verification</p>
            <p className="text-2xl font-bold mt-1 text-warning-600">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-24">
            <p className="text-sm font-medium text-navy-500">Verified Today</p>
            <p className="text-2xl font-bold mt-1 text-success-600">{verifiedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-24">
            <p className="text-sm font-medium text-navy-500">Rejected / Missing</p>
            <p className="text-2xl font-bold mt-1 text-danger-600">{rejectedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center h-24">
            <p className="text-sm font-medium text-navy-500">Verification Rate</p>
            <p className="text-2xl font-bold mt-1 text-navy-900">{verifyRate}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent POD Submissions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Shipment</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-navy-500">No submissions found.</TableCell>
                  </TableRow>
                )}
                {submissions.map((row) => (
                  <TableRow key={row.id} className={selectedPreview?.id === row.id ? 'bg-navy-50' : ''}>
                    <TableCell className="font-medium text-primary-600">{row.id}</TableCell>
                    <TableCell>{row.rec}</TableCell>
                    <TableCell className="text-navy-500">{row.t}</TableCell>
                    <TableCell>{row.d}</TableCell>
                    <TableCell>
                      <Badge variant={row.stat === 'Verified' ? 'success' : row.stat === 'Rejected' ? 'danger' : 'warning'}>
                        {row.stat}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedPreview(row)}>
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedPreview ? (
              <>
                <div className="bg-navy-50 p-3 rounded text-sm text-navy-700">
                  <span className="font-semibold text-navy-900">{selectedPreview.id}</span> • Submitted {selectedPreview.t}
                </div>
                <div>
                  <p className="text-sm font-medium text-navy-500 mb-1">Signature</p>
                  <div className="border border-navy-200 bg-white rounded p-4 h-24 flex items-center justify-center">
                    <span className="font-[cursive] text-2xl text-navy-900">{selectedPreview.rec !== 'Unknown' ? selectedPreview.rec : 'No Signature'}</span>
                  </div>
                </div>
                <div>
                   <p className="text-sm font-medium text-navy-500 mb-1">Delivery Photo</p>
                   <div className="bg-navy-200 h-32 rounded flex items-center justify-center overflow-hidden">
                     <FileCheck className="h-8 w-8 text-navy-400" />
                   </div>
                </div>
                {selectedPreview.stat === 'Pending' ? (
                  <div className="flex gap-2 pt-2">
                    <Button className="flex-1 bg-success-600 hover:bg-success-700 border-0" onClick={() => handleUpdateStatus(selectedPreview.id, 'Verified')}>
                      <Check className="h-4 w-4 mr-1"/> Verify
                    </Button>
                    <Button className="flex-1 bg-danger-600 hover:bg-danger-700 border-0" onClick={() => handleUpdateStatus(selectedPreview.id, 'Rejected')}>
                      <X className="h-4 w-4 mr-1"/> Reject
                    </Button>
                  </div>
                ) : (
                  <div className={`p-3 rounded text-center text-sm font-medium ${selectedPreview.stat === 'Verified' ? 'bg-success-50 text-success-700' : 'bg-danger-50 text-danger-700'}`}>
                    This submission has been {selectedPreview.stat.toLowerCase()}.
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-navy-400">
                <FileCheck className="h-8 w-8 mb-2" />
                <p>Select a submission to preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
