import Card from '../components/Card';
import { MessageCircle, Phone, Mail, CheckCircle, ArrowRight } from 'lucide-react';
import { getWhatsAppLink, getTelLink } from '../utils/phone';
import { Link } from 'react-router-dom';

export default function About() {
  const contactPhone = '+201002275857';
  const contactEmail = 'mohanad.gaber@bold-routes.com';

  const steps = [
    {
      number: 1,
      title: 'Apply to Become a Partner',
      description: 'Submit your application with company details and sales team information.',
    },
    {
      number: 2,
      title: 'Get Approved & Onboarded',
      description: 'Our team reviews your application and provides access to our platform and resources.',
    },
    {
      number: 3,
      title: 'Access Premium Inventory',
      description: 'Get exclusive access to new launches and premium properties from top developers.',
    },
    {
      number: 4,
      title: 'Close Deals & Earn',
      description: 'Use our brand recognition to close deals and earn higher commission rates.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About Bold Routes Partners</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          We empower small and medium real estate brokerages to achieve bigger success by 
          leveraging our established brand and developer relationships.
        </p>
      </div>

      {/* How It Works */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <Card key={step.number} className="text-center relative">
              {step.number < steps.length && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                  <ArrowRight className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {step.number}
              </div>
              <h3 className="text-lg font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600 text-sm">{step.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Why Choose Bold Routes?</h2>
            <div className="space-y-4">
              {[
                'Higher commission rates up to 5% on closed deals',
                'Established relationships with top Egyptian developers',
                'Professional brand recognition and trust',
                'Comprehensive marketing support and materials',
                'Dedicated account management and support',
                'Exclusive access to new property launches',
                'Streamlined deal processing and payments',
                'No upfront costs or hidden fees'
              ].map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-gray-600 mb-6">
                Join hundreds of successful partners who have increased their earnings with Bold Routes.
              </p>
              <Link to="/apply" className="btn-primary">
                Apply Now
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Contact Section */}
      <section>
        <Card>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <p className="text-gray-600 mb-8">
              Have questions about our partnership program? We're here to help.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <a
                href={getWhatsAppLink(contactPhone, 'Hi Bold Routes, I\'d like to know more about your partnership program.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-6 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <MessageCircle className="w-8 h-8 text-green-500 mb-3" />
                <h3 className="font-semibold mb-2">WhatsApp</h3>
                <p className="text-sm text-gray-600">Quick response via WhatsApp</p>
              </a>
              
              <a
                href={getTelLink(contactPhone)}
                className="flex flex-col items-center p-6 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Phone className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-sm text-gray-600">Speak directly with our team</p>
              </a>
              
              <a
                href={`mailto:${contactEmail}`}
                className="flex flex-col items-center p-6 rounded-xl border border-gray-200 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <Mail className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-sm text-gray-600">Send us a detailed message</p>
              </a>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
