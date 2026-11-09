import Link from 'next/link'
import { Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-surface-dim text-on-surface pb-24">
      <div className="px-6 py-12 max-w-7xl mx-auto space-y-10">

        {/* Brand */}
        <div>
          <p className="font-headline font-bold text-xl tracking-[-0.04em] text-primary mb-2">BANJARAN</p>
          <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-xs">
            Born from Malaysia&apos;s mountains. Worn on every trail, summit, and street.
          </p>
        </div>

        {/* Links — two columns */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="label-caps text-on-surface-variant/50 mb-4">Shop</p>
            <ul className="space-y-3">
              {[
                { href: '/shop',               label: 'All Products' },
                { href: '/shop?category=tee',  label: 'Tees'         },
                { href: '/shop?featured=true', label: 'Featured'     },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-body text-sm text-on-surface-variant active:text-primary transition-colors touch-manipulation">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label-caps text-on-surface-variant/50 mb-4">Help</p>
            <ul className="space-y-3">
              {[
                { href: '/shipping', label: 'Shipping Info' },
                { href: '/returns',  label: 'Returns'       },
                { href: '/faq',      label: 'FAQ'           },
                { href: '/contact',  label: 'Contact Us'    },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="font-body text-sm text-on-surface-variant active:text-primary transition-colors touch-manipulation">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Social */}
        <div className="flex gap-3">
          <a
            href="https://instagram.com/banjaranofficial"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
            className="w-10 h-10 flex items-center justify-center border border-outline/20 text-on-surface-variant active:border-primary active:text-primary transition-colors touch-manipulation rounded-sm"
          >
            <Instagram className="w-4 h-4" aria-hidden="true" />
          </a>
          <a
            href="https://tiktok.com/@banjaranofficial"
            target="_blank"
            rel="noreferrer"
            aria-label="TikTok"
            className="w-10 h-10 flex items-center justify-center border border-outline/20 text-on-surface-variant active:border-primary active:text-primary transition-colors text-xs font-bold touch-manipulation rounded-sm"
          >
            TK
          </a>
        </div>

        {/* Bottom */}
        <div className="pt-6 border-t border-outline/10 space-y-3">
          <div className="flex gap-5">
            <Link href="/privacy" className="label-caps text-on-surface-variant/50 active:text-primary touch-manipulation">Privacy</Link>
            <Link href="/terms"   className="label-caps text-on-surface-variant/50 active:text-primary touch-manipulation">Terms</Link>
          </div>
          <p className="label-caps text-on-surface-variant/30">
            &copy; {new Date().getFullYear()} Banjaran. Made in Malaysia.
          </p>
        </div>
      </div>
    </footer>
  )
}
