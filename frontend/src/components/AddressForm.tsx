import { useState } from "react";
import { Building2, Home, MapPin } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import type { Address } from "./AddressBook";

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: Address) => void;
  address?: Address | null;
}

export function AddressForm({ isOpen, onClose, onSave, address }: AddressFormProps) {
  const [formData, setFormData] = useState({
    fullName: address?.fullName || "",
    mobile: address?.mobile || "",
    addressLine1: address?.addressLine1 || "",
    addressLine2: address?.addressLine2 || "",
    city: address?.city || "",
    state: address?.state || "",
    pincode: address?.pincode || "",
    label: address?.label || "home",
    isDefault: address?.isDefault || false
  });
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = `${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/addresses${address ? `/${address._id}` : ''}`;
      const response = await fetch(url, {
        method: address ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save address');

      const savedAddress = await response.json();
      toast({
        title: address ? "Address updated" : "Address added",
        description: address ? "Your address has been updated successfully" : "Your new address has been saved",
      });

      onSave(savedAddress);
    } catch (error) {
      toast({
        title: "Error saving address",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLabelChange = (value: string) => {
    setFormData(prev => ({ ...prev, label: value as 'home' | 'work' | 'other' }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{address ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mobile">Mobile Number</Label>
            <Input
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              placeholder="Enter your mobile number"
              required
              pattern="[0-9]{10}"
              title="Please enter a valid 10-digit mobile number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1}
              onChange={handleInputChange}
              placeholder="House/Flat No., Building Name, Street"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2}
              onChange={handleInputChange}
              placeholder="Area, Landmark (Optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Enter state"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">PIN Code</Label>
            <Input
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleInputChange}
              placeholder="Enter PIN code"
              required
              pattern="[0-9]{6}"
              title="Please enter a valid 6-digit PIN code"
            />
          </div>

          <div className="space-y-2">
            <Label>Address Type</Label>
            <RadioGroup
              value={formData.label}
              onValueChange={handleLabelChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="home" id="home" />
                <Label htmlFor="home" className="flex items-center gap-1">
                  <Home className="h-4 w-4" /> Home
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="work" id="work" />
                <Label htmlFor="work" className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" /> Work
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> Other
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={formData.isDefault}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label htmlFor="isDefault">Set as default address</Label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : address ? 'Update Address' : 'Save Address'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}