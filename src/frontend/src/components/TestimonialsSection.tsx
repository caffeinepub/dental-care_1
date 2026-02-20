import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    initial: 'RK',
    rating: 5,
    text: 'Bahut hi achha experience raha. Doctor ne bina dard ke mera root canal kiya. Staff bhi bahut helpful hai.',
  },
  {
    name: 'Priya Sharma',
    initial: 'PS',
    rating: 5,
    text: 'Meri beti ke danton ka treatment yahan karwaya. Doctors bachon ke saath bahut pyaar se pesh aate hain.',
  },
  {
    name: 'Amit Patel',
    initial: 'AP',
    rating: 5,
    text: 'Teeth whitening karwane ke baad meri smile bilkul badal gayi. Highly recommended!',
  },
];

export default function TestimonialsSection() {
  return (
    <section className="container py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Mareezon Ki Raay</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Hamare khush patients kya kehte hain
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">4.9/5 Google Rating</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {testimonials.map((testimonial, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {testimonial.initial}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{testimonial.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Before/After photos available at clinic with patient consent
        </p>
      </div>
    </section>
  );
}
