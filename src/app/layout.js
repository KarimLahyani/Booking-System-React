import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import NavigationBar from "./components/NavigationBar";

export const metadata = {
  title: "Booking System",
  description: "CS391 Project 2 hotel booking application",
  icons: {
    icon: "/images/favicon.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NavigationBar />
        {children}
      </body>
    </html>
  );
}
