import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Demo = {
  title: string;
  description: string;
  href: string;
};

const demos: Demo[] = [
  {
    title: 'Web Components',
    description: 'Interactive demo of web components including auto-resizing textareas',
    href: '/demo/web-components',
  },
  // Add more demos here as they're created
];

export default function DemosPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Ampshare Demos</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo) => (
          <Link key={demo.href} href={demo.href}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle>{demo.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{demo.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
