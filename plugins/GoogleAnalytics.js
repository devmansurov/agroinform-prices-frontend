export default async ({app}) => {
  const GA_CODE = 'G-PWQK6WQ58Q';

  window.dataLayer = window.dataLayer || [];

  function gtag() {
    dataLayer.push(arguments);
  }

  gtag('js', new Date());

  gtag('config', GA_CODE);

  const script = document.createElement('script')
  script.src = `https://www.googletagmanager.com/gtag/js?id=` + GA_CODE
  script.async = true
  document.head.appendChild(script);
}
