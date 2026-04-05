export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const validateShop = ({ name, link }) => {
    const errors = {};

    if (!name.trim()) {
        errors.name = "店名は必須です";
    }

    if (link && !isValidUrl(link)) {
        errors.link = "URLが正しくありません";
    }

    return errors;
}
