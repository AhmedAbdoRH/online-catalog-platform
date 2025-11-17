import { Button } from '@/components/ui/button';
import { UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Header from '@/components/common/Header';

export default async function LandingPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={null} />
      <main className="flex-1 flex flex-col items-center justify-center text-center p-6">
        <UtensilsCrossed className="w-24 h-24 text-primary mb-6" />
        <h1 className="text-4xl md:text-6xl font-headline font-bold mb-4 text-primary-dark">
          أهلاً بك في <span className="text-primary">قائمة طعامي</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          أنشئ قائمة طعام إلكترونية مذهلة وعصرية لمطعمك أو مقهاك في دقائق. سهلة، سريعة، ومتجاوبة مع كل الأجهزة.
        </p>
        <Button asChild size="lg" className="font-bold">
          <Link href="/login">ابدأ الآن مجاناً</Link>
        </Button>
      </main>
      <footer className="py-6 px-4 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} قائمة طعامي. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
