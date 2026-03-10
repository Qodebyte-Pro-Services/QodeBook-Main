"use client";

import { Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import {
  Database,
  DatabaseBackup,
  RefreshCcw,
  Moon,
  Sun,
  Calendar,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { useIsStaffActive } from "@/store/state/lib/ui-state-manager";

const SystemSettings = ({ sectionVariant, isPhoneView }: {
  sectionVariant: Variants;
  isPhoneView: boolean;
}) => {
  const { toast } = useToast();
  const [systemTheme, setSystemTheme] = useState<boolean>(() => {
    const currrentStatus = localStorage.getItem("system-theme");
    return currrentStatus ? JSON.parse(currrentStatus) : false;
  });
  const [dateFormat, setDateFormat] = useState<string>("YYYY-MM-DD");
  const [timeFormat, setTimeFormat] = useState<string>("24h");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  const { isStaff } = useIsStaffActive();

  // Update time every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}:${seconds}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (systemTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("system-theme", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("system-theme", "false");
    }
  }, [systemTheme]);

  const handleBackup = async () => {
    setIsUpdating(true);

    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUpdating(false);
    toast({
      title: "Backup Successful",
      description: "Your database has been backed up successfully.",
    });
  };

  const handleUpdateCheck = async () => {
    setIsUpdating(true);

    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsUpdating(false);
    toast({
      title: "You're up to date",
      description: "Your system is running the latest version (v1.0.0).",
    });
  };

  const formatOptions = [
    { id: "12h", label: "12-hour format", value: "12h" },
    { id: "24h", label: "24-hour format", value: "24h" },
  ];

  const dateFormatOptions = [
    { id: "MM/DD/YYYY", label: "MM/DD/YYYY" },
    { id: "DD/MM/YYYY", label: "DD/MM/YYYY" },
    { id: "YYYY-MM-DD", label: "YYYY-MM-DD" },
  ];

  return (
    <motion.div
      key="system-settings"
      variants={sectionVariant}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={cn(`w-full mt-2 ${isPhoneView ? 'mb-24' : ''} space-y-6`)}
    >
      {/* Appearance Settings */}
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-black">
        <div className="h-2 bg-gradient-to-r from-green-500 to-green-600 dark:bg-gradient-to-r dark:from-green-600 dark:to-green-500" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-600 dark:text-green-100">
              {systemTheme ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Appearance</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Customize how the app looks and feels</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 dark:bg-black">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="space-y-1">
              <Label htmlFor="dark-mode" className="text-sm font-medium">
                Dark Mode
              </Label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {systemTheme ? 'Dark theme is enabled' : 'Light theme is enabled'}
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={systemTheme}
              onCheckedChange={setSystemTheme}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Date & Time Settings */}
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-black">
        <div className="h-2 bg-gradient-to-r from-green-500 to-green-600 dark:bg-gradient-to-r dark:from-green-600 dark:to-green-500" />
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-600 dark:text-green-100">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">Date & Time</CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">Configure date and time display settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 dark:bg-black">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Time Format</Label>
              <div className="grid grid-cols-2 gap-3">
                {formatOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setTimeFormat(option.value)}
                    className={cn(
                      "flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors",
                      timeFormat === option.value
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    )}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                    {timeFormat === option.value && (
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg
                          className="w-3.5 h-3.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Date Format</Label>
              <div className="grid grid-cols-3 gap-3">
                {dateFormatOptions.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => setDateFormat(option.id)}
                    className={cn(
                      "flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors text-sm font-medium",
                      dateFormat === option.id
                        ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
                    )}
                  >
                    {option.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Current System Time</Label>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-mono font-bold text-gray-900 dark:text-white">
                  {currentTime}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Maintenance */}
      {isStaff === "user" && (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg dark:bg-black">
          <div className="h-2 bg-gradient-to-r from-green-500 to-green-600 dark:bg-gradient-to-r dark:from-green-600 dark:to-green-500" />
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 text-green-600 dark:bg-green-600 dark:text-green-100">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">System Maintenance</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">Manage system backups and updates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 border border-green-100 dark:border-green-900/50 bg-green-50 dark:bg-green-900/10 rounded-lg">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-800 dark:text-green-200">
                      System Maintenance
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Last backup: {new Date().toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-auto py-3"
                  onClick={handleBackup}
                  disabled={isUpdating}
                >
                  <DatabaseBackup className="w-4 h-4 mr-2" />
                  <div className="text-left">
                    <div className="font-medium">Backup Database</div>
                    <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                      Create a system backup
                    </p>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto py-3"
                  onClick={handleUpdateCheck}
                  disabled={isUpdating}
                >
                  <RefreshCcw className={`w-4 h-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                  <div className="text-left">
                    <div className="font-medium">Check for Updates</div>
                    <p className="text-xs font-normal text-gray-500 dark:text-gray-400">
                      Current: v1.0.0
                    </p>
                  </div>
                </Button>
              </div>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button variant="destructive" className="w-full sm:w-auto text-white">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Reset to Factory Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};

export default SystemSettings;