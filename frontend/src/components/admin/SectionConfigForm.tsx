import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Save, Eye } from 'lucide-react';

interface SectionConfigFormProps {
    apiBase: string;
    sectionId: string;
    sectionName: string;
}

export const SectionConfigForm = ({ apiBase, sectionId, sectionName }: SectionConfigFormProps) => {
    const [title, setTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [isVisible, setIsVisible] = useState(true);
    const [imageUrl, setImageUrl] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        loadConfig();
    }, [sectionId]);

    const loadConfig = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${apiBase}/api/sections/${sectionId}`);
            if (res.ok) {
                const data = await res.json();
                setTitle(data.title || "");
                setSubtitle(data.subtitle || "");
                setIsVisible(data.isVisible !== false);
                setImageUrl(data.imageUrl || "");
            }
        } catch (error) {
            console.error("Failed to load section config", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            setFile(f);
            setPreviewUrl(URL.createObjectURL(f));
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const form = new FormData();
            form.append("title", title);
            form.append("subtitle", subtitle);
            form.append("isVisible", String(isVisible));
            if (file) {
                form.append("image", file);
            }
            // If explicit existing URL is needed to be preserved or cleared?
            // The backend preserves it if no new image is uploaded.
            // If we want to allow clearing image, we'd need a clear flag. 
            // For now, assuming overwrite or keep.

            const res = await fetch(`${apiBase}/api/admin/sections/${sectionId}`, {
                method: "POST",
                body: form,
            });

            if (res.ok) {
                const data = await res.json();
                setImageUrl(data.imageUrl);
                setFile(null);
                setPreviewUrl(null);
                alert("Section updated successfully!");
            } else {
                alert("Failed to save section");
            }
        } catch (error) {
            console.error("Failed to save", error);
            alert("Error saving section");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-4 flex justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <Card className="w-full">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg font-medium flex items-center justify-between">
                    <span>{sectionName}</span>
                    {isVisible ?
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1"><Eye className="w-3 h-3" /> Visible</span> :
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded flex items-center gap-1"><Eye className="w-3 h-3 text-gray-400" /> Hidden</span>
                    }
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor={`sec-title-${sectionId}`}>Section Title</Label>
                            <Input
                                id={`sec-title-${sectionId}`}
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g., Summer Sale"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`sec-subtitle-${sectionId}`}>Subtitle (Optional)</Label>
                            <Input
                                id={`sec-subtitle-${sectionId}`}
                                value={subtitle}
                                onChange={e => setSubtitle(e.target.value)}
                                placeholder="e.g., Up to 50% Off"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Banner Image (Poster)</Label>
                            <div className="flex flex-col gap-4">
                                {(previewUrl || imageUrl) && (
                                    <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border">
                                        <img
                                            src={previewUrl || imageUrl}
                                            alt="Banner Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="cursor-pointer"
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Recommended size: 1200x400px</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2 rounded-md border p-4">
                            <Checkbox
                                id={`sec-vis-${sectionId}`}
                                checked={isVisible}
                                onCheckedChange={(c) => setIsVisible(!!c)}
                            />
                            <Label htmlFor={`sec-vis-${sectionId}`} className="cursor-pointer flex-1">
                                Show this section on Home Page
                            </Label>
                        </div>
                    </div>

                    <div className="pt-2">
                        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Settings
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};
