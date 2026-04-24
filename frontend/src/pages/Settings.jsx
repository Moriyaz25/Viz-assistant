import { Settings as SettingsIcon, Moon, User, Bell, Shield } from 'lucide-react'

const Settings = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">Settings</h1>
                <p className="text-muted-foreground">Manage your preferences and account</p>
            </div>

            <div className="bg-card rounded-xl border border-border max-w-4xl">
                <div className="divide-y divide-border">
                    {/* Appearance */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                <Moon className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium">Appearance</h3>
                                <p className="text-sm text-muted-foreground">Customize your interface theme</p>
                            </div>
                        </div>
                        <button className="px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                            Toggle Theme
                        </button>
                    </div>

                    {/* Account */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <User className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium">Account</h3>
                                <p className="text-sm text-muted-foreground">Manage your profile details</p>
                            </div>
                        </div>
                        <button className="px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                            Edit Profile
                        </button>
                    </div>

                    {/* Notifications */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                                <Bell className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium">Notifications</h3>
                                <p className="text-sm text-muted-foreground">Configure alert preferences</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" defaultChecked />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>

                    {/* Security */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <Shield className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-medium">Security</h3>
                                <p className="text-sm text-muted-foreground">Password and authentication</p>
                            </div>
                        </div>
                        <button className="px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors">
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Settings
