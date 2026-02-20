import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Clock, MessageCircle } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

export default function ContactSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: 'url(/assets/generated/clinic-interior.dim_1200x600.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="container relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Humse Sampark Karein</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kisi bhi sawal ya appointment ke liye humse sampark karein
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <Card className="backdrop-blur-sm bg-card/95">
            <CardHeader>
              <CardTitle>Clinic Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video rounded-lg overflow-hidden mb-4">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3502.2873034788894!2d77.2090212!3d28.6139391!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce2daa9eb4d0b%3A0x717971125923e5d!2sIndia%20Gate!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Clinic Location"
                />
              </div>
              <div className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <p>123 Main Street, Medical Complex, New Delhi - 110001</p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Clinic Timings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Somvaar - Shanivaar</span>
                    <span className="font-semibold">9:00 AM - 8:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ravivaar</span>
                    <span className="font-semibold">Band</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-card/95">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Phone Number</p>
                  <a
                    href="tel:+919876543210"
                    className="text-lg font-semibold hover:text-primary transition-colors"
                  >
                    +91 98765 43210
                  </a>
                </div>
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => window.open('https://wa.me/919876543210', '_blank')}
                >
                  <SiWhatsapp className="w-5 h-5 mr-2" />
                  WhatsApp Par Baat Karein
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
