import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Cpu, Clock, DollarSign } from 'lucide-react';

const features = [
  {
    icon: Award,
    title: 'Expert Doctors',
    description: '10+ saalon ka tajurba',
    color: 'bg-chart-1/10 text-chart-1',
  },
  {
    icon: Cpu,
    title: 'Modern Tech',
    description: 'Latest machines aur sterilization',
    color: 'bg-chart-2/10 text-chart-2',
  },
  {
    icon: Clock,
    title: 'Emergency Care',
    description: '24/7 dental emergency support',
    color: 'bg-chart-3/10 text-chart-3',
  },
  {
    icon: DollarSign,
    title: 'Affordable Price',
    description: 'Sahi daam par behtareen ilaaj',
    color: 'bg-chart-4/10 text-chart-4',
  },
];

export default function WhyChooseUsSection() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Humein Kyun Chunein?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hum apne patients ko sabse behtar care aur service dene mein vishwas rakhte hain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-16 h-16 rounded-full ${feature.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
