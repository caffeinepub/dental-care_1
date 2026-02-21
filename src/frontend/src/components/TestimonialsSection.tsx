import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    initial: 'RK',
    rating: 5,
    text: 'Excellent experience! The doctor performed my root canal completely pain-free. The staff is very helpful and professional.',
  },
  {
    name: 'Priya Sharma',
    initial: 'PS',
    rating: 5,
    text: 'I brought my daughter here for treatment. The doctors are wonderful with children and very caring. Highly recommend!',
  },
  {
    name: 'Amit Patel',
    initial: 'AP',
    rating: 5,
    text: 'After getting teeth whitening done, my smile has completely transformed. Amazing results! Highly recommended!',
  },
  {
    name: 'Sneha Reddy',
    initial: 'SR',
    rating: 5,
    text: 'Best dental clinic in the area! Modern equipment and very professional staff. My dental implant procedure was smooth and painless.',
  },
  {
    name: 'Vikram Singh',
    initial: 'VS',
    rating: 5,
    text: 'Great service and affordable prices. The doctors take time to explain everything clearly. Very satisfied with my treatment.',
  },
];

export default function TestimonialsSection() {
  const [api, setApi] = useState<CarouselApi>();
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!api) return;

    const autoplay = setInterval(() => {
      if (!isHovered) {
        api.scrollNext();
      }
    }, 6000);

    return () => clearInterval(autoplay);
  }, [api, isHovered]);

  return (
    <section 
      id="testimonials" 
      className="container py-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Patient Reviews</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          What our happy patients have to say
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

      <div className="max-w-5xl mx-auto">
        <Carousel
          setApi={setApi}
          opts={{
            align: 'start',
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="hover:shadow-lg transition-all duration-300 h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
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
                      <p className="text-muted-foreground leading-relaxed">
                        {testimonial.text}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  );
}
