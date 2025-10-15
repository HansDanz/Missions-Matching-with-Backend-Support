import { Heart, Globe, Users } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AnimatedCounter } from './AnimatedCounter';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
  onCreateProfile: () => void;
}

export function LoginPage({ onLogin, onCreateProfile }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(email, password);
  };

  const stats = [
    {
      icon: Heart,
      value: '9 in 10',
      label: 'Christians want purpose led work',
      color: 'text-red-500'
    },
    {
      icon: Globe,
      value: '3.4',
      label: 'billion people have not heard the gospel',
      color: 'text-blue-500'
    },
    {
      icon: Users,
      value: '7290',
      label: 'unreached people groups',
      color: 'text-green-500'
    }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image and Stats */}
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-indigo-100 p-12 flex flex-col justify-center">
        <div className="max-w-xl mx-auto w-full space-y-8">
          {/* Image with Quote */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWNrcGFja2VyJTIwbW91bnRhaW4lMjBoaWtpbmd8ZW58MXx8fHwxNzYwMTY5NTgyfDA&ixlib=rb-4.1.0&q=80&w=1080"
              alt="Backpacker"
              className="w-full h-96 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <p className="text-white text-2xl italic">
                "The harvest is plentiful but the workers are few"
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex flex-col items-center text-center space-y-3">
                  <stat.icon className={`w-10 h-10 ${stat.color}`} />
                  <div className="text-3xl">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 bg-white p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="text-center mb-8">
            <h1 className="text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue your mission</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-center text-muted-foreground mb-4">
              Don't have an account?
            </p>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onCreateProfile}
            >
              Create Profile
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
