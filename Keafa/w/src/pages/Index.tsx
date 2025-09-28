import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-elegant">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary">
              Keafa Design
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light">
              Premium Ethiopian Traditional Cloth Management System
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Manage your traditional cloth orders with elegance and precision. 
              Track individual measurements, family groups, payments, and delivery schedules 
              all in one beautiful, intuitive system.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-12">
            <button
              onClick={() => navigate('/add-individual')}
              className="bg-gradient-primary text-secondary-foreground px-8 py-4 rounded-lg font-semibold shadow-elegant hover:shadow-xl transition-all transform hover:scale-105"
            >
              Create Individual Order
            </button>
            <button
              onClick={() => navigate('/individual-orders')}
              className="border-2 border-primary text-primary px-8 py-4 rounded-lg font-semibold hover:bg-accent transition-all"
            >
              View All Orders
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-4xl mx-auto">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl text-secondary-foreground">👤</span>
              </div>
              <h3 className="font-semibold text-primary">Individual Management</h3>
              <p className="text-sm text-muted-foreground">
                Track detailed measurements, photos, and design preferences for each customer
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl text-secondary-foreground">👨‍👩‍👧‍👦</span>
              </div>
              <h3 className="font-semibold text-primary">Family Groups</h3>
              <p className="text-sm text-muted-foreground">
                Organize multiple individual orders into family groups with combined billing
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl text-secondary-foreground">💰</span>
              </div>
              <h3 className="font-semibold text-primary">Payment Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor payment status and delivery schedules with detailed reporting
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;