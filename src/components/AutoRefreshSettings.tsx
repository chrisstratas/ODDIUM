import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AutoRefreshSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentInterval: number;
  onIntervalChange: (interval: number) => void;
  autoRefreshEnabled: boolean;
  onAutoRefreshChange: (enabled: boolean) => void;
}

export const AutoRefreshSettings = ({
  open,
  onOpenChange,
  currentInterval,
  onIntervalChange,
  autoRefreshEnabled,
  onAutoRefreshChange
}: AutoRefreshSettingsProps) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadPreferences();
    }
  }, [open]);

  const loadPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_refresh_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setNotificationsEnabled(data.notifications_enabled);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const { error } = await supabase
      .from('user_refresh_preferences')
      .upsert({
        user_id: user.id,
        auto_refresh_enabled: autoRefreshEnabled,
        refresh_interval: currentInterval / 60000, // Convert ms to minutes
        notifications_enabled: notificationsEnabled
      });

    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Saved",
        description: "Auto-refresh preferences saved"
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Auto-Refresh Settings</DialogTitle>
          <DialogDescription>
            Configure how often live data updates automatically
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-refresh">Enable Auto-Refresh</Label>
            <Switch
              id="auto-refresh"
              checked={autoRefreshEnabled}
              onCheckedChange={onAutoRefreshChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Refresh Interval</Label>
            <Select
              value={currentInterval.toString()}
              onValueChange={(value) => onIntervalChange(parseInt(value))}
              disabled={!autoRefreshEnabled}
            >
              <SelectTrigger id="interval">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={(2 * 60 * 1000).toString()}>Every 2 minutes</SelectItem>
                <SelectItem value={(3 * 60 * 1000).toString()}>Every 3 minutes</SelectItem>
                <SelectItem value={(5 * 60 * 1000).toString()}>Every 5 minutes</SelectItem>
                <SelectItem value={(10 * 60 * 1000).toString()}>Every 10 minutes</SelectItem>
                <SelectItem value={(15 * 60 * 1000).toString()}>Every 15 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notifications">Movement Notifications</Label>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
              disabled={!autoRefreshEnabled}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={savePreferences} disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
