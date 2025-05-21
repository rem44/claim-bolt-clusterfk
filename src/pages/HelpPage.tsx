import React from 'react';
import { Book, FileText, Phone, Mail, MessageCircle, User } from 'lucide-react';

const HelpPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Help & Support</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <Book className="h-6 w-6 text-corporate-secondary mr-2" />
            <h2 className="text-lg font-medium">Documentation</h2>
          </div>
          <div className="space-y-4">
            <a 
              href="#" 
              className="block p-3 bg-gray-50 rounded-md hover:bg-corporate-light transition-colors"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-corporate-secondary mr-2" />
                <div>
                  <div className="font-medium">Getting Started Guide</div>
                  <div className="text-sm text-gray-500">Learn the basics of using the claims system</div>
                </div>
              </div>
            </a>
            <a 
              href="#" 
              className="block p-3 bg-gray-50 rounded-md hover:bg-corporate-light transition-colors"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-corporate-secondary mr-2" />
                <div>
                  <div className="font-medium">User Manual</div>
                  <div className="text-sm text-gray-500">Detailed documentation of all features</div>
                </div>
              </div>
            </a>
            <a 
              href="#" 
              className="block p-3 bg-gray-50 rounded-md hover:bg-corporate-light transition-colors"
            >
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-corporate-secondary mr-2" />
                <div>
                  <div className="font-medium">FAQ</div>
                  <div className="text-sm text-gray-500">Common questions and answers</div>
                </div>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <MessageCircle className="h-6 w-6 text-corporate-secondary mr-2" />
            <h2 className="text-lg font-medium">Contact Support</h2>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-corporate-light rounded-lg border border-corporate-secondary/20">
              <div className="flex items-center mb-3">
                <User className="h-5 w-5 text-corporate-secondary mr-2" />
                <div className="font-medium text-corporate-dark">Primary Support Contact</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="font-medium w-24">Name:</div>
                  <div>Remi Duval</div>
                </div>
                <div className="flex items-center">
                  <div className="font-medium w-24">Position:</div>
                  <div>Technical Support Lead</div>
                </div>
                <a 
                  href="mailto:remi.duval@venturecarpets.com"
                  className="flex items-center text-corporate-secondary hover:text-corporate-accent transition-colors"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  remi.duval@venturecarpets.com
                </a>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-corporate-secondary mr-2" />
                <div>
                  <div className="font-medium">Phone Support</div>
                  <div className="text-sm text-gray-500">1-800-RESOLIA</div>
                  <div className="text-xs text-gray-500">Monday - Friday, 9AM - 5PM EST</div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-corporate-secondary mr-2" />
                <div>
                  <div className="font-medium">General Support Email</div>
                  <div className="text-sm text-gray-500">support@resolia.com</div>
                  <div className="text-xs text-gray-500">24/7 response within 24 hours</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-medium mb-4">Video Tutorials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            'Creating a New Claim',
            'Managing Documents',
            'Processing Claims',
            'Generating Reports'
          ].map((title) => (
            <div key={title} className="p-4 border border-gray-200 rounded-md hover:border-corporate-secondary transition-colors">
              <div className="aspect-video bg-gray-100 rounded-md mb-2"></div>
              <div className="font-medium">{title}</div>
              <div className="text-sm text-gray-500">3:45 mins</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HelpPage;