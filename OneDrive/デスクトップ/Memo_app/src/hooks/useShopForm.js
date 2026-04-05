import { useState } from "react";
import { validateShop } from "../utils/validateShop";

export const useShopForm = (initialData) => {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        //エラーを消す
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ""
            }));
        }
    };

    const validate = () => {
        const validationErrors = validateShop(formData);
        setErrors(validationErrors);
        return validationErrors;
    };

    const reset = (newData = initialData) => {
        setFormData(newData);
        setErrors({});
    };

    return {
        formData,
        setFormData,
        errors,
        handleChange,
        validate,
        reset
    };
};
