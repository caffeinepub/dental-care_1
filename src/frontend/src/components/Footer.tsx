export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 bg-muted/30 mt-20">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl">🦷</span>
              </div>
              <span className="font-bold text-xl">Satya Dental Care</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Advanced technology and pain-free treatment at your trusted dental clinic.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Phone: <a href="tel:+916352174912" className="hover:text-foreground transition-colors">+91 635-217-4912</a></p>
              <p>Email: <a href="mailto:anasjadala@gmail.com" className="hover:text-foreground transition-colors">anasjadala@gmail.com</a></p>
              <p>WhatsApp: <a href="https://wa.me/916352174912" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">+91 635-217-4912</a></p>
              <p>Hours: Monday - Saturday</p>
              <p>9 AM - 8 PM</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Services</p>
              <p>About Us</p>
              <p>Contact</p>
              <p>Emergency Care</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
          <p>© {currentYear} Satya Dental Care</p>
        </div>
      </div>
    </footer>
  );
}
