export const formatDate = (dateString?: string) => {
    if (!dateString) return 'Recent';
    if (dateString.toLowerCase() === 'recent') return 'Recent';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString; // Return as-is if not a valid date

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    } catch (e) {
        return dateString;
    }
};
