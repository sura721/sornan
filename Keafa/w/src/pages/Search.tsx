import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { SearchIcon, Users, UserCheck } from "lucide-react";
import { searchOrdersApi } from "@/contexts/ApiService"; // Import the new API function

// Define a type for our search results
type SearchResult = {
  _id: string;
  type: 'individual' | 'family';
  firstName?: string;
  lastName?: string;
  familyName?: string;
  phoneNumbers?: { primary?: string };
};

const Search = () => {
  const navigate = useNavigate();
  const [nameQuery, setNameQuery] = useState("");
  const [phoneQuery, setPhoneQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (query: string, type: 'name' | 'phone') => {
    if (!query.trim()) {
      toast({ description: "Please enter a search term." });
      return;
    }
    
    setIsLoading(true);
    setSearchResults([]); // Clear previous results

    try {
      const results = await searchOrdersApi(query.trim(), type);
      
      if (results.length > 0) {
        setSearchResults(results);
      } else {
        toast({
          title: "Not Found",
          description: "No orders matched your search query.",
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Search Failed",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>, query: string, type: 'name' | 'phone') => {
    if (event.key === 'Enter') {
      handleSearch(query, type);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-primary mb-2">Search Orders</h1>
        <p className="text-muted-foreground">Find an order by first name or phone number.</p>
      </div>

      <div className="space-y-6">
        {/* Search by Name */}
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-primary font-serif">Search by First Name</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex-grow space-y-2">
              <Label htmlFor="name-search" className="sr-only">Enter first name</Label>
              <Input id="name-search" value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} onKeyPress={(e) => handleKeyPress(e, nameQuery, 'name')} placeholder="e.g., Abebe" />
            </div>
            <Button onClick={() => handleSearch(nameQuery, 'name')} disabled={isLoading} className="self-end">
              <SearchIcon className="w-4 h-4 mr-2" /> {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </CardContent>
        </Card>

        {/* Search by Phone */}
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-primary font-serif">Search by Phone Number</CardTitle></CardHeader>
          <CardContent className="flex items-center gap-4">
            <div className="flex-grow space-y-2">
              <Label htmlFor="phone-search" className="sr-only">Enter phone number</Label>
              <Input id="phone-search" type="tel" value={phoneQuery} onChange={(e) => setPhoneQuery(e.target.value)} onKeyPress={(e) => handleKeyPress(e, phoneQuery, 'phone')} placeholder="e.g., 0911..." />
            </div>
            <Button onClick={() => handleSearch(phoneQuery, 'phone')} disabled={isLoading} className="self-end">
              <SearchIcon className="w-4 h-4 mr-2" /> {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* --- NEW: Display Search Results --- */}
      {searchResults.length > 0 && (
        <Card className="shadow-card border-0">
          <CardHeader><CardTitle className="text-primary font-serif">Search Results ({searchResults.length})</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {searchResults.map((result) => (
              <button
                key={result._id}
                onClick={() => navigate(`/orders?highlight=${result._id}`)}
                className="w-full text-left p-3 bg-accent/50 rounded-lg hover:bg-accent transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {result.type === 'individual' ? <UserCheck className="w-5 h-5 text-primary" /> : <Users className="w-5 h-5 text-primary" />}
                  <div>
                    <p className="font-medium">{result.type === 'individual' ? `${result.firstName} ${result.lastName}` : result.familyName}</p>
                    <p className="text-sm text-muted-foreground">{result.phoneNumbers?.primary || 'No Phone'}</p>
                  </div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Search;