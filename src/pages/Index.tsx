import { CarnaticMetronome } from '@/components/CarnaticMetronome';

const Index = () => {
  console.log("Index component is rendering");
  
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Test</h1>
          <p className="text-muted-foreground">If you can see this, the app is loading</p>
        </div>
        <CarnaticMetronome />
      </div>
    </main>
  );
};

export default Index;
