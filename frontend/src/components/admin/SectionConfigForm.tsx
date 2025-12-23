import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, Save, Eye, Settings, ListFilter, CheckSquare, Square } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

    // Advanced Metadata State (Manual Curation)
    const [mode, setMode] = useState<"auto" | "manual">("auto");
    const [selectionType, setSelectionType] = useState<"category" | "specific_products">("category");
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [selectAllInCategory, setSelectAllInCategory] = useState(true);

    // Dynamic Lists
    const [categories, setCategories] = useState<any[]>([]);
    const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
    const [fetchingProducts, setFetchingProducts] = useState(false);

    // Discounted Products Row States
    const [orangeTitle, setOrangeTitle] = useState("");
    const [orangePrice, setOrangePrice] = useState("");
    const [orangeBanner, setOrangeBanner] = useState("");
    const [orangeProductIds, setOrangeProductIds] = useState<string[]>([]);
    const [orangeCatId, setOrangeCatId] = useState("");
    const [orangeProducts, setOrangeProducts] = useState<any[]>([]);

    const [greenTitle, setGreenTitle] = useState("");
    const [greenPrice, setGreenPrice] = useState("");
    const [greenBanner, setGreenBanner] = useState("");
    const [greenProductIds, setGreenProductIds] = useState<string[]>([]);
    const [greenCatId, setGreenCatId] = useState("");
    const [greenProducts, setGreenProducts] = useState<any[]>([]);

    useEffect(() => {
        loadConfig();
        fetchCategories();
    }, [sectionId]);

    useEffect(() => {
        if (mode === "manual" && selectionType === "category" && selectedCategoryId) {
            fetchCategoryProducts(selectedCategoryId);
        }
    }, [selectedCategoryId, mode, selectionType]);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${apiBase}/api/admin/categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to fetch categories", error);
        }
    };

    const fetchCategoryProducts = async (catId: string, target?: 'most_loved' | 'orange' | 'green') => {
        if (!target || target === 'most_loved') setFetchingProducts(true);
        try {
            const res = await fetch(`${apiBase}/api/admin/products?categoryId=${catId}`);
            if (res.ok) {
                const data = await res.json();
                const prods = Array.isArray(data) ? data : [];
                if (target === 'orange') setOrangeProducts(prods);
                else if (target === 'green') setGreenProducts(prods);
                else setCategoryProducts(prods);
            }
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            if (!target || target === 'most_loved') setFetchingProducts(false);
        }
    };

    useEffect(() => {
        if (sectionId === "discounted_products" && orangeCatId) {
            fetchCategoryProducts(orangeCatId, 'orange');
        }
    }, [orangeCatId, sectionId]);

    useEffect(() => {
        if (sectionId === "discounted_products" && greenCatId) {
            fetchCategoryProducts(greenCatId, 'green');
        }
    }, [greenCatId, sectionId]);

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

                // Handle metadata
                if (data.metadata) {
                    const meta = data.metadata;
                    setMode(meta.mode || "auto");
                    setSelectionType(meta.selectionType || "category");
                    setSelectedCategoryId(meta.categoryId || "");
                    setSelectedProductIds(meta.productIds || []);
                    setSelectAllInCategory(meta.selectAllInCategory !== false);

                    // Row specific
                    setOrangeTitle(meta.orangeTitle || "");
                    setOrangePrice(meta.orangePrice || "");
                    setOrangeBanner(meta.orangeBanner || "");
                    setOrangeProductIds(meta.orangeProductIds || []);
                    setOrangeCatId(meta.orangeCatId || "");

                    setGreenTitle(meta.greenTitle || "");
                    setGreenPrice(meta.greenPrice || "");
                    setGreenBanner(meta.greenBanner || "");
                    setGreenProductIds(meta.greenProductIds || []);
                    setGreenCatId(meta.greenCatId || "");
                }
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

            // Append metadata as JSON string
            const metadata = {
                mode,
                selectionType,
                categoryId: selectedCategoryId,
                productIds: selectedProductIds,
                selectAllInCategory,
                orangeTitle,
                orangePrice,
                orangeBanner,
                orangeProductIds,
                orangeCatId,
                greenTitle,
                greenPrice,
                greenBanner,
                greenProductIds,
                greenCatId
            };
            form.append("metadata", JSON.stringify(metadata));
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

                        {/* ADVANCED CURATION (Only for most_loved) */}
                        {sectionId === "most_loved" && (
                            <div className="mt-8 border rounded-xl overflow-hidden bg-gray-50/50">
                                <div className="bg-gray-100/80 px-4 py-3 border-b flex items-center gap-2">
                                    <ListFilter className="w-4 h-4 text-gray-600" />
                                    <span className="font-semibold text-sm text-gray-700 uppercase tracking-wider">Most Loved Curation Mode</span>
                                </div>
                                <div className="p-4 space-y-6">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium">Display Logic</Label>
                                        <div className="flex bg-white rounded-lg p-1 border w-fit">
                                            <button
                                                type="button"
                                                onClick={() => setMode("auto")}
                                                className={`px-4 py-1.5 rounded-md text-sm transition-all ${mode === "auto" ? "bg-black text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                                            >
                                                Automated (Sales Based)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setMode("manual")}
                                                className={`px-4 py-1.5 rounded-md text-sm transition-all ${mode === "manual" ? "bg-black text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                                            >
                                                Manual Selection
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 italic">
                                            {mode === "auto" ? "The system will automatically show the top 20 selling products." : "Choose exactly which products or categories to showcase."}
                                        </p>
                                    </div>

                                    {mode === "manual" && (
                                        <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label>Select Category</Label>
                                                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Pick a category..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map((cat) => (
                                                                <SelectItem key={cat._id} value={cat._id}>
                                                                    {cat.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Selection Rule</Label>
                                                    <div className="flex items-center space-x-2 h-10 px-3 rounded-md border bg-white">
                                                        <Checkbox
                                                            id="select-all-cat"
                                                            checked={selectAllInCategory}
                                                            onCheckedChange={(c) => setSelectAllInCategory(!!c)}
                                                            disabled={!selectedCategoryId}
                                                        />
                                                        <Label htmlFor="select-all-cat" className="text-sm cursor-pointer">Show All Products in Category</Label>
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedCategoryId && !selectAllInCategory && (
                                                <div className="bg-white rounded-xl border p-4 space-y-4">
                                                    <div className="flex items-center justify-between border-b pb-3">
                                                        <Label className="font-semibold">Pick Specific Products</Label>
                                                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                                            {selectedProductIds.length} Selected
                                                        </Badge>
                                                    </div>

                                                    {fetchingProducts ? (
                                                        <div className="flex items-center justify-center py-8">
                                                            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                                                        </div>
                                                    ) : (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                                            {categoryProducts.length > 0 ? (
                                                                categoryProducts.map((p) => (
                                                                    <div
                                                                        key={p._id}
                                                                        className={`flex items-center space-x-3 p-2 rounded-lg border transition-all cursor-pointer ${selectedProductIds.includes(p._id) ? "bg-orange-50 border-orange-200" : "hover:bg-gray-50"}`}
                                                                        onClick={() => {
                                                                            const ids = selectedProductIds.includes(p._id)
                                                                                ? selectedProductIds.filter(id => id !== p._id)
                                                                                : [...selectedProductIds, p._id];
                                                                            setSelectedProductIds(ids);
                                                                        }}
                                                                    >
                                                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedProductIds.includes(p._id) ? "bg-orange-600 border-orange-600" : "bg-white border-gray-300"}`}>
                                                                            {selectedProductIds.includes(p._id) && <CheckSquare className="w-3 h-3 text-white" />}
                                                                        </div>
                                                                        <div className="flex-1 flex items-center gap-2">
                                                                            <img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover shadow-sm" />
                                                                            <span className="text-sm font-medium line-clamp-1">{p.nameEn}</span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <div className="col-span-2 py-4 text-center text-gray-500 text-sm italic">No products found in this category.</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* DISCOUNTED PRODUCTS SPECIFIC CURATION */}
                        {sectionId === "discounted_products" && (
                            <div className="mt-8 space-y-8">
                                <Tabs defaultValue="orange" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="orange" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">Orange Offer Box</TabsTrigger>
                                        <TabsTrigger value="green" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Green Offer Box</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="orange" className="space-y-6 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Orange Box Title</Label>
                                                <Input value={orangeTitle} onChange={e => setOrangeTitle(e.target.value)} placeholder="e.g., Alpro Organic Juice" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Orange Box Price Tag</Label>
                                                <Input value={orangePrice} onChange={e => setOrangePrice(e.target.value)} placeholder="e.g., $15.00" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Banner / Asset URL (Image on the right)</Label>
                                                <Input value={orangeBanner} onChange={e => setOrangeBanner(e.target.value)} placeholder="Image URL for the juice bottle" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t pt-4">
                                            <Label className="font-semibold block">Select 2 Products for this Row</Label>
                                            <div className="flex gap-4 items-end">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-xs">Filter by Category</Label>
                                                    <Select value={orangeCatId} onValueChange={setOrangeCatId}>
                                                        <SelectTrigger><SelectValue placeholder="Category..." /></SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Badge variant="outline" className={`${orangeProductIds.length === 2 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                                    {orangeProductIds.length}/2 Selected
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3 bg-white">
                                                {orangeProducts.map(p => (
                                                    <div
                                                        key={p._id}
                                                        onClick={() => {
                                                            if (orangeProductIds.includes(p._id)) setOrangeProductIds(prev => prev.filter(id => id !== p._id));
                                                            else if (orangeProductIds.length < 2) setOrangeProductIds(prev => [...prev, p._id]);
                                                        }}
                                                        className={`flex items-center gap-2 p-1.5 rounded border text-sm cursor-pointer transition-colors ${orangeProductIds.includes(p._id) ? 'bg-orange-50 border-orange-400' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                                                        <span className="flex-1 truncate">{p.nameEn}</span>
                                                        {orangeProductIds.includes(p._id) ? <CheckSquare className="w-4 h-4 text-orange-600" /> : <Square className="w-4 h-4 text-gray-300" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="green" className="space-y-6 pt-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>Green Box Title</Label>
                                                <Input value={greenTitle} onChange={e => setGreenTitle(e.target.value)} placeholder="e.g., Organic Fresh Food" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Green Box Price Tag</Label>
                                                <Input value={greenPrice} onChange={e => setGreenPrice(e.target.value)} placeholder="e.g., $25.00" />
                                            </div>
                                            <div className="space-y-2 md:col-span-2">
                                                <Label>Banner / Asset URL (Image on the right)</Label>
                                                <Input value={greenBanner} onChange={e => setGreenBanner(e.target.value)} placeholder="Image URL for the food plate" />
                                            </div>
                                        </div>

                                        <div className="space-y-4 border-t pt-4">
                                            <Label className="font-semibold block">Select 2 Products for this Row</Label>
                                            <div className="flex gap-4 items-end">
                                                <div className="flex-1 space-y-2">
                                                    <Label className="text-xs">Filter by Category</Label>
                                                    <Select value={greenCatId} onValueChange={setGreenCatId}>
                                                        <SelectTrigger><SelectValue placeholder="Category..." /></SelectTrigger>
                                                        <SelectContent>
                                                            {categories.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <Badge variant="outline" className={`${greenProductIds.length === 2 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                                    {greenProductIds.length}/2 Selected
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3 bg-white">
                                                {greenProducts.map(p => (
                                                    <div
                                                        key={p._id}
                                                        onClick={() => {
                                                            if (greenProductIds.includes(p._id)) setGreenProductIds(prev => prev.filter(id => id !== p._id));
                                                            else if (greenProductIds.length < 2) setGreenProductIds(prev => [...prev, p._id]);
                                                        }}
                                                        className={`flex items-center gap-2 p-1.5 rounded border text-sm cursor-pointer transition-colors ${greenProductIds.includes(p._id) ? 'bg-green-50 border-green-600' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <img src={p.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                                                        <span className="flex-1 truncate">{p.nameEn}</span>
                                                        {greenProductIds.includes(p._id) ? <CheckSquare className="w-4 h-4 text-green-600" /> : <Square className="w-4 h-4 text-gray-300" />}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        )}
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
