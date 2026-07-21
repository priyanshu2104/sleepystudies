import { useRouter } from "next/navigation";

export function useScrollToSubjects() {
    const router = useRouter();

    const handleScroll = (e: React.MouseEvent) => {
        e.preventDefault();
        
        // If we are on the homepage, scroll smoothly
        const element = document.getElementById("subjects");
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        } else {
            // If on another page, navigate to home with scroll parameter
            router.push("/?scroll=subjects");
        }
    };

    return handleScroll;
}
