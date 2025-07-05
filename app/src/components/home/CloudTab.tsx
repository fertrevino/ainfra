import { useState, useEffect, useCallback } from 'react';
import { CloudProvider, CloudCredentials, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  CloudIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon
} from 'lucide-react';

interface CloudTabProps {
  user: User;
}

interface CredentialsFormData {
  name: string;
  provider: CloudProvider;
  // AWS
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  // Azure
  subscriptionId: string;
  tenantId: string;
  clientId: string;
  clientSecret: string;
  // Google Cloud
  projectId: string;
  keyFile: string;
}

const initialFormData: CredentialsFormData = {
  name: '',
  provider: 'aws',
  accessKeyId: '',
  secretAccessKey: '',
  region: 'us-east-1',
  subscriptionId: '',
  tenantId: '',
  clientId: '',
  clientSecret: '',
  projectId: '',
  keyFile: ''
};

const cloudProviders = [
  { value: 'aws', label: 'Amazon Web Services (AWS)', icon: '🟧' },
  { value: 'azure', label: 'Microsoft Azure', icon: '🔵' },
  { value: 'gcp', label: 'Google Cloud Platform', icon: '🔴' }
] as const;

export function CloudTab({ user }: CloudTabProps) {
  const [credentials, setCredentials] = useState<CloudCredentials[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CredentialsFormData>(initialFormData);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const session = {
    data: {
      session: {
        access_token: ''
      }
    }
  };
  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    try {
      const accessToken = session?.data?.session?.access_token;
      const res = await fetch(`/api/cloud-credentials?user_id=${user.id}`, {
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
      });
      console.log('res', res)

      if (res.ok) {
        const data = await res.json();
        console.log('Fetched credentials:', data);
        setCredentials(data.credentials || []);
      } else {
        setError('Failed to fetch cloud credentials');
      }
    } catch (err) {
      console.error('Error fetching credentials:', err);
      setError('Error fetching cloud credentials');
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  // Fetch credentials on component mount
  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const handleCreateCredentials = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setShowDialog(true);
    setError(null);
  };

  const handleEditCredentials = (cred: CloudCredentials) => {
    setFormData({
      name: cred.name,
      provider: cred.provider,
      accessKeyId: cred.credentials.accessKeyId || '',
      secretAccessKey: cred.credentials.secretAccessKey || '',
      region: cred.credentials.region || 'us-east-1',
      subscriptionId: cred.credentials.subscriptionId || '',
      tenantId: cred.credentials.tenantId || '',
      clientId: cred.credentials.clientId || '',
      clientSecret: cred.credentials.clientSecret || '',
      projectId: cred.credentials.projectId || '',
      keyFile: cred.credentials.keyFile || ''
    });
    setEditingId(cred.id);
    setShowDialog(true);
    setError(null);
  };

  const handleSaveCredentials = async () => {
    if (!formData.name.trim()) {
      setError('Please provide a name for these credentials');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const accessToken = session.data.session?.access_token;

      const credentialsData: {
        user_id: string;
        name: string;
        provider: CloudProvider;
        credentials: Record<string, string>;
        id?: string;
      } = {
        user_id: user.id,
        name: formData.name,
        provider: formData.provider,
        credentials: {}
      };

      // Add provider-specific credentials
      if (formData.provider === 'aws') {
        if (!formData.accessKeyId || !formData.secretAccessKey) {
          setError('AWS Access Key ID and Secret Access Key are required');
          setSaving(false);
          return;
        }
        credentialsData.credentials = {
          accessKeyId: formData.accessKeyId,
          secretAccessKey: formData.secretAccessKey,
          region: formData.region
        };
      } else if (formData.provider === 'azure') {
        if (!formData.subscriptionId || !formData.tenantId || !formData.clientId || !formData.clientSecret) {
          setError('All Azure credentials fields are required');
          setSaving(false);
          return;
        }
        credentialsData.credentials = {
          subscriptionId: formData.subscriptionId,
          tenantId: formData.tenantId,
          clientId: formData.clientId,
          clientSecret: formData.clientSecret
        };
      } else if (formData.provider === 'gcp') {
        if (!formData.projectId || !formData.keyFile) {
          setError('GCP Project ID and Service Account Key are required');
          setSaving(false);
          return;
        }
        try {
          JSON.parse(formData.keyFile); // Validate JSON
        } catch {
          setError('Service Account Key must be valid JSON');
          setSaving(false);
          return;
        }
        credentialsData.credentials = {
          projectId: formData.projectId,
          keyFile: formData.keyFile
        };
      }

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `/api/cloud-credentials?id=${editingId}`
        : '/api/cloud-credentials';

      if (editingId) {
        credentialsData.id = editingId;
      }

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        body: JSON.stringify(credentialsData)
      });

      if (res.ok) {
        setShowDialog(false);
        setFormData(initialFormData);
        setEditingId(null);
        fetchCredentials();
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Failed to save credentials');
      }
    } catch (err) {
      console.error('Error saving credentials:', err);
      setError('Error saving credentials');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    setShowDeleteDialog(false);
    try {
      const accessToken = session.data.session?.access_token;
      const res = await fetch(`/api/cloud-credentials?id=${deletingId}`, {
        method: 'DELETE',
        headers: {
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        }
      });
      if (res.ok) {
        fetchCredentials();
      } else {
        setError('Failed to delete credentials');
      }
    } catch (err) {
      console.error('Error deleting credentials:', err);
      setError('Error deleting credentials');
    } finally {
      setDeletingId(null);
    }
  };

  const togglePasswordVisibility = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const renderCredentialsForm = () => {
    switch (formData.provider) {
      case 'aws':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Access Key ID</label>
              <Input
                type="text"
                value={formData.accessKeyId}
                onChange={(e) => setFormData(prev => ({ ...prev, accessKeyId: e.target.value }))}
                placeholder="AKIA..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Secret Access Key</label>
              <div className="relative">
                <Input
                  type={showPasswords.secretAccessKey ? "text" : "password"}
                  value={formData.secretAccessKey}
                  onChange={(e) => setFormData(prev => ({ ...prev, secretAccessKey: e.target.value }))}
                  placeholder="Enter your AWS Secret Access Key"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => togglePasswordVisibility('secretAccessKey')}
                >
                  {showPasswords.secretAccessKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Region</label>
              <Input
                type="text"
                value={formData.region}
                onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value }))}
                placeholder="us-east-1"
              />
            </div>
          </>
        );

      case 'azure':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subscription ID</label>
              <Input
                type="text"
                value={formData.subscriptionId}
                onChange={(e) => setFormData(prev => ({ ...prev, subscriptionId: e.target.value }))}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tenant ID</label>
              <Input
                type="text"
                value={formData.tenantId}
                onChange={(e) => setFormData(prev => ({ ...prev, tenantId: e.target.value }))}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client ID</label>
              <Input
                type="text"
                value={formData.clientId}
                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Client Secret</label>
              <div className="relative">
                <Input
                  type={showPasswords.clientSecret ? "text" : "password"}
                  value={formData.clientSecret}
                  onChange={(e) => setFormData(prev => ({ ...prev, clientSecret: e.target.value }))}
                  placeholder="Enter your Azure Client Secret"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => togglePasswordVisibility('clientSecret')}
                >
                  {showPasswords.clientSecret ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </>
        );

      case 'gcp':
        return (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Project ID</label>
              <Input
                type="text"
                value={formData.projectId}
                onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                placeholder="my-gcp-project"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Service Account Key (JSON)</label>
              <textarea
                value={formData.keyFile}
                onChange={(e) => setFormData(prev => ({ ...prev, keyFile: e.target.value }))}
                placeholder='{"type": "service_account", "project_id": "...", ...}'
                className="w-full h-32 px-3 py-2 text-sm border border-input rounded-md bg-transparent resize-none"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CloudIcon className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Cloud Credentials</h2>
        </div>
        <Button onClick={handleCreateCredentials} className="flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Credentials
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="flex-1 bg-card/50 rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading credentials...</div>
          </div>
        ) : credentials.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center p-6">
            <CloudIcon className="h-12 w-12 text-muted-foreground mb-3" />
            <h3 className="text-lg font-medium mb-2">No Cloud Credentials</h3>
            <p className="text-muted-foreground mb-4">Connect your cloud providers to deploy infrastructure</p>
            <Button onClick={handleCreateCredentials} variant="outline">
              Add Your First Credentials
            </Button>
          </div>
        ) : (
          <div className="p-4">
            <div className="grid gap-4">
              {credentials.map((cred) => {
                const provider = cloudProviders.find(p => p.value === cred.provider);
                return (
                  <div key={cred.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{provider?.icon}</span>
                        <div>
                          <h3 className="font-medium">{cred.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {provider?.label}
                            {cred.is_active && (
                              <span className="ml-2 inline-flex items-center gap-1 text-green-600">
                                <CheckCircleIcon className="h-3 w-3" />
                                Active
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditCredentials(cred)}
                          className="h-8 w-8 p-0"
                        >
                          <EditIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(cred.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Created: {new Date(cred.created_at).toLocaleDateString()}
                      {cred.updated_at !== cred.created_at && (
                        <span className="ml-2">
                          Updated: {new Date(cred.updated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Credentials Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Edit' : 'Add'} Cloud Credentials
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My AWS Account"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cloud Provider</label>
              <select
                value={formData.provider}
                onChange={(e) => setFormData(prev => ({ ...prev, provider: e.target.value as CloudProvider }))}
                className="w-full h-9 px-3 py-1 text-sm border border-input rounded-md bg-transparent"
                disabled={!!editingId} // Don't allow changing provider when editing
              >
                {cloudProviders.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {provider.icon} {provider.label}
                  </option>
                ))}
              </select>
            </div>

            {renderCredentialsForm()}

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCredentials} disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Cloud Credentials?</DialogTitle>
          </DialogHeader>
          <div className="py-2 text-sm text-muted-foreground">
            Are you sure you want to delete these credentials? This action cannot be undone.
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
