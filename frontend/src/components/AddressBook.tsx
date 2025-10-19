import { useEffect, useState } from "react";
import { Building2, Home, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { AddressForm } from "./AddressForm";

export interface Address {
  _id: string;
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  label: 'home' | 'work' | 'other';
}

interface AddressBookProps {
  onSelect?: (address: Address) => void;
  selectedId?: string;
  showActions?: boolean;
}

export function AddressBook({ onSelect, selectedId, showActions = true }: AddressBookProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const { token } = useAuth();

  const fetchAddresses = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch addresses');
      const data = await response.json();
      setAddresses(data);
    } catch (error) {
      toast({
        title: "Error fetching addresses",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [token]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/addresses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to delete address');
      
      toast({
        title: "Address deleted",
        description: "Your address has been removed successfully",
      });
      
      fetchAddresses();
    } catch (error) {
      toast({
        title: "Error deleting address",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/addresses/${id}/default`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Failed to set default address');
      
      toast({
        title: "Default address updated",
        description: "Your default delivery address has been updated",
      });
      
      fetchAddresses();
    } catch (error) {
      toast({
        title: "Error updating default address",
        description: "Please try again later",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleSave = (savedAddress: Address) => {
    setIsFormOpen(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  const renderIcon = (label: string) => {
    switch (label) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'work':
        return <Building2 className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Add New Address Button */}
      <Button
        onClick={() => { setEditingAddress(null); setIsFormOpen(true); }}
        variant="outline"
        className="w-full py-8 border-dashed"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add New Address
      </Button>

      {/* Address Form Modal */}
      <AddressForm
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setEditingAddress(null); }}
        onSave={handleSave}
        address={editingAddress}
      />

      {/* Address Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map(address => (
          <Card
            key={address._id}
            className={`p-4 relative ${
              selectedId === address._id ? 'ring-2 ring-primary' : ''
            } ${onSelect ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
            onClick={() => onSelect && onSelect(address)}
          >
            {/* Label Badge */}
            <div className="flex items-center gap-2 mb-2">
              <Badge variant={address.label === 'home' ? 'default' : 'secondary'} className="capitalize flex items-center gap-1">
                {renderIcon(address.label)}
                {address.label}
              </Badge>
              {address.isDefault && (
                <Badge variant="outline" className="ml-2">Default</Badge>
              )}
            </div>

            {/* Address Details */}
            <div className="space-y-1 mb-4">
              <p className="font-medium">{address.fullName}</p>
              <p className="text-sm text-muted-foreground">{address.mobile}</p>
              <p className="text-sm">{address.addressLine1}</p>
              {address.addressLine2 && <p className="text-sm">{address.addressLine2}</p>}
              <p className="text-sm">{`${address.city}, ${address.state} - ${address.pincode}`}</p>
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex gap-2 mt-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(address)}>
                  Edit
                </Button>
                {!address.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => handleSetDefault(address._id)}>
                    Set as Default
                  </Button>
                )}
                {addresses.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(address._id);
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    Delete
                  </Button>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}