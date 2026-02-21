import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, Mail } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export default function ContactSection() {
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ threshold: 0.2 });
  const { ref: mapRef, isVisible: mapVisible } = useScrollAnimation({ threshold: 0.2 });

  return (
    <section id="contact" className="bg-muted/30 py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get in touch with us for any questions or to schedule an appointment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Contact Information */}
          <Card 
            ref={cardsRef as React.RefObject<HTMLDivElement>}
            className={`h-full ${cardsVisible ? 'animate-fade-in' : 'opacity-0'}`}
          >
            <CardHeader>
              <CardTitle>Get In Touch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Clinic Location</h3>
                  <p className="text-muted-foreground">
                    123 Dental Street, Medical District<br />
                    City, State 12345
                  </p>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Phone Number</h3>
                  <a 
                    href="tel:+916352174912" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    +91 635-217-4912
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Email Address</h3>
                  <a 
                    href="mailto:anasjadala@gmail.com" 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    anasjadala@gmail.com
                  </a>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Clinic Hours</h3>
                  <p className="text-muted-foreground">
                    Monday - Saturday: 9 AM - 8 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>

              {/* WhatsApp Button */}
              <div className="pt-4">
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-all"
                  size="lg"
                  onClick={() => window.open('https://wa.me/916352174912', '_blank')}
                >
                  <SiWhatsapp className="w-5 h-5 mr-2" />
                  Chat on WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Google Maps */}
          <Card 
            ref={mapRef as React.RefObject<HTMLDivElement>}
            className={`h-full ${mapVisible ? 'animate-fade-in-delay-200' : 'opacity-0'}`}
          >
            <CardHeader>
              <CardTitle>Find Us</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[4/3] rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.2412648718453!2d-73.98784368459395!3d40.74844097932847!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c259a9b3117469%3A0xd134e199a405a163!2sEmpire%20State%20Building!5e0!3m2!1sen!2sus!4v1234567890123!5m2!1sen!2sus"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Clinic Location"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
