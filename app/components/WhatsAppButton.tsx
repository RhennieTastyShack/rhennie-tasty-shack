"use client";

export default function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2348121577759"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-50 flex h-14 w-14 touch-manipulation items-center justify-center rounded-full bg-green-500 text-white shadow-2xl transition-transform duration-300 hover:scale-105 hover:bg-green-600 sm:right-6 sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:h-16 sm:w-16 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-400"
      aria-label="Chat with us on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
        className="h-8 w-8 fill-current"
        aria-hidden="true"
      >
        <path d="M380.9 97.1C339-44.5 151.7-35.7 77.7 63.2 28.5 129.6 18.4 214.8 50.2 289L0 480l195.4-49.3c71.4 38.4 161.8 28.2 223.7-33.8 95.8-95.7 95.8-250.8 0-346.5zM224 438.6c-34.6 0-68.6-9.3-98.2-26.8l-7-4.2-116 29.2 30.9-113.1-4.6-7.3C-24.5 212.4 32.5 83.3 158.4 50.7c125.9-32.6 252.5 62.6 252.5 193.3 0 107.2-87.1 194.6-194.9 194.6zm107-145.9c-5.9-3-34.9-17.2-40.3-19.1-5.4-2-9.3-3-13.2 3-3.9 5.9-15.2 19.1-18.6 23-3.4 3.9-6.9 4.4-12.8 1.5-35.1-17.6-58.2-31.4-81.4-71.1-6.1-10.4 6.1-9.7 17.4-32.3 2-3.9 1-7.4-.5-10.4-1.5-3-13.2-31.8-18.1-43.5-4.7-11.2-9.5-9.7-13.2-9.9h-11.3c-3.9 0-10.4 1.5-15.9 7.4-5.4 5.9-20.8 20.3-20.8 49.4s21.3 57.2 24.2 61.1c3 3.9 42 64.1 101.8 89.9 37.7 16.3 52.5 17.7 71.4 14.9 11.5-1.7 34.9-14.2 39.8-28 4.9-13.8 4.9-25.6 3.4-28-1.4-2.5-5.4-3.9-11.3-6.9z" />
      </svg>
    </a>
  );
}
