import Link from "next/link";
import Image from "next/image";

const socialLinks = [
  {
    name: "Facebook",
    short: "/Facebook.svg",
    urlx: "https://www.facebook.com/Survex/",
  },
  {
    name: "Instagram",
    short: "/Instagram.svg",
    urlx: "https://www.instagram.com/Survex/",
  },
  {
    name: "YouTube",
    short: "/Youtube.svg",
    urlx: "https://www.youtube.com/Survex/",
  },
  {
    name: "TikTok",
    short: "/TikTok.svg",
    urlx: "https://www.tiktok.com/Survex/",
  },
];

type SiteFooterProps = {
  className?: string;
};

export default function SiteFooter({ className = "" }: SiteFooterProps) {
  return (
    <footer
      className={`mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 ${className}`.trim()}
    >
      <div className="space-y-2">
        <p className="text-sm text-slate-400">
          (c) {new Date().getFullYear()} SURVEX.app. All rights reserved.
        </p>
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
          <Link href="/Privacy" className="text-slate-300 hover:text-cyan-200">
            Privacy Policy
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/Cookies" className="text-slate-300 hover:text-cyan-200">
            Cookies Policy
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/Terms" className="text-slate-300 hover:text-cyan-200">
            Terms and Conditions
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/faq" className="text-slate-300 hover:text-cyan-200">
            FAQ
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/blog" className="text-slate-300 hover:text-cyan-200">
            Blog
          </Link>
          <span className="text-slate-600">|</span>
          <Link href="/contact" className="text-slate-300 hover:text-cyan-200">
            Contact
          </Link>
          <span className="text-slate-600">|</span>
          <a
            href="mailto:Support@survex.app"
            className="cursor-pointer text-slate-300 hover:text-cyan-200"
          >
            Support@survex.app
          </a>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {socialLinks.map((social) => (
          <a
            key={social.name}
            href={social.urlx}
            aria-label={social.name}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-[11px] font-bold uppercase text-slate-200 hover:border-cyan-300/60 hover:text-cyan-200"
          >
            <Image
              src={social.short}
              alt=""
              width={18}
              height={18}
              className="h-[18px] w-[18px]"
            />
          </a>
        ))}
      </div>
    </footer>
  );
}
