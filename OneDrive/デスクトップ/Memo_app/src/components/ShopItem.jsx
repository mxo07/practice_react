import { useEffect, useRef, useState } from 'react'
import "./ShopItem.css"
import { validateShop } from '../utils/validateShop';
import { useShopForm } from '../hooks/useShopForm';
import { useOgp } from '../hooks/useOgp';

function ShopItem({ shop, deleteShop, updateShop, onTagClick, selectedTags, allTags }) {

    const nameInputRef = useRef(null);
    const tagInputRef = useRef(null);
    const suggestRefs = useRef([]);

    const [isEditing, setIsEditing] = useState(false);
    // const isEditing = editingId === shop.id;
    const [newTag, setNewTag] = useState("");
    const cardRef = useRef(null);
    const saveRef = useRef(() => { });
    const { ogp, loading, error } = useOgp(shop.link);


    const [modal, setModal] = useState(null);

    // const [editData, setEditData] = useState({
    //     name: shop.name,
    //     memo: shop.memo,
    //     tags: shop.tags || [],
    //     link: shop.link || ""
    // });

    const {
        formData,
        errors,
        handleChange,
        validate,
        setFormData
    } = useShopForm({
        name: shop.name,
        memo: shop.memo,
        tags: shop.tags || [],
        link: shop.link || ""
    });


    useEffect(() => {
        setFormData({
            name: shop.name,
            memo: shop.memo,
            tags: shop.tags || [],
            link: shop.link || ""
        });
    }, [shop]);

    const initialDataRef = useRef(formData);

    useEffect(() => {
        initialDataRef.current = {
            name: shop.name,
            memo: shop.memo,
            tags: shop.tags || [],
            link: shop.link || ""
        };
    }, [shop]);

    const isChanged = () => {
        const prev = initialDataRef.current;
        const curr = formData;

        return (
            prev.name !== curr.name ||
            prev.memo !== curr.memo ||
            prev.link !== curr.link ||
            JSON.stringify(prev.tags) !== JSON.stringify(curr.tags)
        );
    };

    const save = () => {
        const errors = validate();
        if (Object.keys(errors).length > 0) return;

        if (!isChanged()) {
            setIsEditing(false);
            return;
        }
        updateShop(shop.id, formData);
        setIsEditing(false);
    };

    // const [ogp, setOgp] = useState({
    //     title: '',
    //     description: '',
    //     image: ''
    // });

    const [selectedIndex, setSelectedIndex] = useState(0);

    // useEffect(() => {
    //     setOgp(shop.ogp || { title: '', description: '', image: '' });
    // }, [shop.ogp]);


    const getLinkLabel = (url) => {

        if (!url) return "";

        if (url.includes("instagram.com")) return "📸 Instagram";
        if (url.includes("tiktok.com")) return "🎵 TikTok";
        if (url.includes("youtube.com")) return "▶ YouTube";

        return "🔗 リンク";
    }

    useEffect(() => {
        saveRef.current = save;
    }, [save]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!isEditing) return;

            //cardの外をクリックしたら保存
            if (cardRef.current && 
                !cardRef.current.contains(e.target) && 
                !e.target.closest(".toast")) {
                saveRef.current();
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isEditing]);

    //空欄エラー
    const handleBlur = (e) => {

        //次にフォーカスされる要素
        const next = e.relatedTarget;

        //外クリック
        if (!next) {

            if (document.activeElement?.closest(".tag-suggest")) return;
            save();
            return;
        }

        //同じコンポーネント内なら何もしない
        if (e.currentTarget.contains(next)) return;

        // if (!formData.name.trim()) {
        //     setNameError(true);
        //     nameInputRef.current?.focus();

        //     return;
        // }

        //サジェストクリックは保存しない
        if (next.closest(".tag-suggest")) return;

        const errors = validate();
        if (Object.keys(errors).length > 0) return;

        // //外に出た時だけ保存
        // updateShop(shop.id, formData);
        // setIsEditing(false);

        save();
    }


    const handleKeyDown = (e) => {

        if (e.key === "Enter") {

            // const errors = validateShop(editData);
            // setErrors(errors);
            const errors = validate();
            if (Object.keys(errors).length > 0) return;

            if (!isChanged()) {
                setIsEditing(false);
                return;
            }

            updateShop(shop.id, formData);
            setIsEditing(false);
        }

        if (e.key === "Escape") {
            setFormData({
                name: shop.name,
                memo: shop.memo,
                tags: shop.tags || [],
                link: shop.link || ""
            });
            setIsEditing(false);
        }
    }

    // useEffect(() => {
    //     if (shop._meta?.keepEditing) return;
    //     setIsEditing(false);
    // }, [shop]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!modal) return;

            if (e.key === "Enter") {
                e.preventDefault();
                e.stopPropagation();

                if (modal?.type === "card") {
                    deleteShop(shop.id);
                }
                setModal(null);
            }

            if (e.key === "Escape") {
                setModal(null);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [modal]);

    //タグ削除
    const removeTag = (tagToRemove) => {

        // const updatedTags = (formData.tags || []).filter(tag => tag !== tagToRemove);

        // const newData = {
        //     ...formData,
        //     tags: updatedTags
        // };
        // setFormData(newData);

        const updatedTags = formData.tags.filter(tag => tag !== tagToRemove);
        handleChange("tags", updatedTags);
        updateShop(shop.id,
            { ...formData, tags: updatedTags },
            {
                silent: true,
                undo: {
                    type: "tag",
                    shopId: shop.id,
                    prevTags: formData.tags
                }
            });
    };


    //タグの追加

    const filteredTags = newTag ? (allTags || []).filter(tag =>
        tag.toLowerCase().includes(newTag.toLowerCase()) && tag !== newTag &&
        !(formData.tags || []).includes(tag)
    ) : [];

    const isDuplicate = formData.tags.includes(newTag.trim());

    const addTag = () => {
        const trimmed = newTag.trim();
        if (!trimmed) return;

        // カンマ・半角スペース・全角スペースで分割
        const splitTags = trimmed
            .split(/[,\s　]+/)
            .map(tag => tag.trim())
            .filter(tag => tag !== "");

        const updatedTags = [
            ...new Set([...formData.tags, ...splitTags])
        ];

        // const newData = {
        //     ...formData,
        //     tags: updatedTags
        // };

        // setFormData(newData);

        handleChange("tags", updatedTags);
        updateShop(shop.id, { ...formData, tags: updatedTags }, { silent: true });

        setNewTag("");
    };

    //サジェスト

    useEffect(() => {
        setSelectedIndex(0);
    }, [newTag]);

    const selectTag = (tag) => {
        const updatedTags = [...formData.tags, tag];

        // const newData = {
        //     ...formData,
        //     tags: updatedTags
        // };

        // setFormData(newData);
        // updateShop(shop.id, newData);

        handleChange("tags", updatedTags);
        updateShop(shop.id, { ...formData, tags: updatedTags });

        setNewTag("");
    };

    useEffect(() => {
        const el = suggestRefs.current[selectedIndex];
        if (el) {
            el.scrollIntoView({
                block: "nearest",
                behavior: "smooth"
            });
        }
    }, [selectedIndex]);

    const canCreateNewTag = newTag.trim() &&
        !(allTags || []).includes(newTag.trim());

    const suggestList = [
        ...filteredTags.map(tag => ({ type: "tag", value: tag })),
        ...(canCreateNewTag ? [{ type: "new", value: newTag }] : [])
    ];

    useEffect(() => {
        suggestRefs.current = [];
    }, [suggestList]);

    const highlightMatch = (text, query) => {
        if (!query) return text;

        const index = text.toLowerCase().indexOf(query.toLowerCase());
        if (index === -1) return text;

        const before = text.slice(0, index);
        const match = text.slice(index, index + query.length);
        const after = text.slice(index + query.length);

        return (
            <>
                {before}
                <span className='highlight'>{match}</span>
                {after}
            </>
        )
    }

    useEffect(() => {
        if (modal) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }

        return () => {
            document.body.classList.remove("modal-open");
        };
    }, [modal]);


    //お気に入り
    const toggleFavorite = () => {
        updateShop(shop.id, { ...shop, favorite: !shop.favorite }, { silent: true });
    };

    //訪問済み
    const toggleVisited = () => {
        updateShop(shop.id, { ...shop, visited: !shop.visited }, { silent: true })
    };

    //優先度
    const setRating = (value) => {
        updateShop(shop.id, { ...shop, rating: value }, { silent: true })
    };

    //地図
    const openMap = () => {
        const query = encodeURIComponent(shop.name);
        const url = `https://www.google.com/maps/search/?api=1&query=${query}`;
        window.open(url, "_blank");
    };

    return (
        <>
            <div
                tabIndex={-1}
                ref={cardRef}
                // onBlur={handleBlur}
                className={`card ${shop.favorite ? "favorite" : ""}`}
            >
                {isEditing ? (
                    <div className='edit-area'>
                        <input
                            ref={nameInputRef}
                            className={`form-input ${errors.name ? "error" : ""}`}
                            value={formData.name}
                            onChange={(e) => {
                                handleChange("name", e.target.value);

                                if (errors.name && e.target.value.trim()) {
                                    // エラー解除はuseShopForm側でやるのが理想
                                }
                            }}

                            onKeyDown={handleKeyDown}
                            autoFocus
                        />

                        {errors.name && (
                            <div className="error-message">
                                {errors.name}
                            </div>
                        )}

                        <input
                            className='form-input'
                            value={formData.memo}
                            onChange={(e) =>
                                handleChange("memo", e.target.value)
                                // setFormData({ ...formData, memo: e.target.value })
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="メモ追加"
                        />
                        <div className="tag-preview">
                            <div className='tag-label'>
                                現在のタグ:
                            </div>

                            {(formData.tags || []).map((tag) => (
                                <span key={tag} className="tag-chip">
                                    #{tag}
                                    <button
                                        className="tag-delete"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeTag(tag);
                                        }}
                                    >

                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className='tag-input-wrapper'>
                            <input
                                ref={tagInputRef}
                                className='form-input'
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyDown={(e) => {

                                    if (e.nativeEvent.isComposing || e.keyCode === 229) return;

                                    if (e.key === "ArrowDown") {
                                        e.preventDefault();

                                        if (suggestList.length === 0) return;

                                        setSelectedIndex((prev) =>
                                            (prev + 1) % suggestList.length
                                        );
                                        return;
                                    }

                                    if (e.key === "ArrowUp") {
                                        e.preventDefault();

                                        if (suggestList.length === 0) return;

                                        setSelectedIndex((prev) =>
                                            (prev - 1 + suggestList.length) % suggestList.length
                                        );
                                        return;
                                    }
                                    if (e.key === "Enter" || e.key === "Tab") {
                                        e.preventDefault();
                                        e.stopPropagation();

                                        const selected = suggestList[selectedIndex];

                                        if (!selected) return;

                                        if (selected.type === "tag") {
                                            selectTag(selected.value);
                                        } else if (selected.type === "new") {
                                            addTag();
                                        }

                                        setSelectedIndex(0);
                                        tagInputRef.current?.focus();
                                        return;
                                    };

                                    // const inSuggesting = newTag && filteredTags.length > 0;

                                    // if (filteredTags.length > 0) {
                                    //     selectTag(filteredTags[selectedIndex]);
                                    // }
                                    // if (newTag.trim()) {
                                    //     addTag();


                                    if (e.key === "Backspace" && !newTag) {
                                        const lastTag = formData.tags[formData.tags.length - 1];
                                        if (lastTag) {
                                            removeTag(lastTag);
                                            setSelectedIndex(0);
                                            tagInputRef.current?.focus();
                                            return;
                                        }
                                    }

                                    if (e.key === "Escape") {
                                        e.stopPropagation();

                                        if (newTag) {
                                            setNewTag("");
                                        } else {
                                            setIsEditing(false);
                                        }

                                    }
                                }}
                                placeholder="タグ追加"
                            />

                            {/* タグサジェスト */}
                            {newTag && (
                                <div className="tag-suggest">
                                    {isDuplicate && (
                                        <div className="tag-warning">
                                            すでに追加されています
                                        </div>
                                    )}

                                    {!isDuplicate && suggestList.length === 0 (
                                        <div className="tag-suggest-empty">
                                            該当なし
                                        </div>
                                    )}

                                    {!isDuplicate && suggestList.map((item, index) => {

                                        if (item.type === "tag") {
                                            return (
                                    <span
                                        key={item.value}
                                        ref={(el) => suggestRefs.current[index] = el}
                                        className={`tag-suggest-item ${index === selectedIndex ? "active" : ""}`}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => selectTag(item.value)}
                                    >

                                        #{highlightMatch(item.value, newTag)}
                                    </span>
                                    );
                                        }

                                    if (item.type === "new") {
                                            return (
                                    <div
                                        key={item.value}
                                        ref={(el) => suggestRefs.current[index] = el}
                                        className={`tag-suggest-create ${index === selectedIndex ? "active" : ""}`}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        onClick={() => addTag()}
                                    >
                                        +「{newTag}」
                                    </div>
                                    );
                                        }

                                    return null;
                                    })}
                                </div>
                                )}
                                
                            {/* 
                                    // const updatedTags = [...editData.tags, tag];

                                    // const newData = {
                                    //     ...editData,
                                    //     tags: updatedTags
                                    //     };

                                    //     setEditData(newData);
                                    //     updateShop(shop.id, newData);
                                    //     setNewTag("");
                                    // }}

                                    // { canCreateNewTag && (
                                    //     <div className='tag-suggest-create'
                                    //         onClick={() => addTag()}>
                                    //         +「{newTag}」
                                    //     </div>
                                    // )}
                                    //         </div>
                                    // )}
                                    //     </div> */}

                            <input
                                className='form-input'
                                value={formData.link || ""}
                                onChange={(e) => {
                                    // setFormData({ ...formData, link: e.target.value })
                                    // if (errors.link) {
                                    //     setErrors(prev => ({ ...prev, link: "" }))
                                    // }
                                    handleChange("link", e.target.value);
                                }}
                                onKeyDown={handleKeyDown}
                                placeholder='リンク'
                            />

                            {errors.link && (
                                <div className='error-message'>
                                    {errors.link}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        {/* 表示モード */}
                        <div onDoubleClick={() => {
                            setFormData({
                                name: shop.name,
                                memo: shop.memo,
                                tags: shop.tags || [],
                                link: shop.link || ""
                            });
                            setIsEditing(true);
                        }}>
                            <div className='card-header'>
                                <div className='title'>
                                    {shop.name}
                                </div>
                                <button
                                    className={`favorite-btn ${shop.favorite ? 'active' : ''}`}
                                    onClick={toggleFavorite}
                                    aria-label="お気に入り">
                                    {shop.favorite ? "★" : "☆"}
                                </button>

                            </div>
                            <div className="shop-status">

                                {/* 訪問済み */}
                                <button
                                    className={`visited-badge ${shop.visited ? "done" : ""}`}
                                    onClick={toggleVisited}
                                >
                                    {shop.visited ? "✅ 行った" : "📍 行きたい"}
                                </button>

                                {/* 評価 */}
                                <div className="rating">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={`star ${shop.rating >= star ? "active" : ""}`}
                                            onClick={() => setRating(star)}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className='memo'>
                                {shop.memo}
                            </div>

                            {shop.link && (
                                <div className="ogp-card">

                                    {error ? (
                                        <div className='ogp-error'>
                                            プレビューできません
                                        </div>
                                    ) : loading ? (
                                        //ローディング
                                        <div className='ogp-loading'>
                                            読み込み中...
                                        </div>
                                    ) : ogp ? (

                                        <a href={shop.link} target="_blank" rel="noopener noreferrer" className="ogp-link">
                                            {ogp.image && (
                                                <img src={ogp.image} alt={ogp.title} className='ogp-image' />)}
                                            <div className="ogp-content">
                                                <div className="ogp-title">{ogp.title}</div>
                                                <div className="ogp-description">{ogp.description}</div>
                                                <div className="ogp-url">{shop.link}</div>
                                            </div>
                                        </a>
                                    ) : null}
                                </div>
                            )}
                        </div>


                        <div className='tag-input-area'>
                            {(formData.tags || []).map((tag, index) => (
                                <span key={tag} className={`tag-chip ${selectedTags.includes(tag) ? "active" : ""}`}>

                                    <span
                                        className='tag-text'
                                        onClick={() => onTagClick(tag)}

                                    >
                                        #{tag}
                                    </span>

                                    <button
                                        className='tag-delete'
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeTag(tag);
                                        }}
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>

                        <div className='card-actions'>
                            <button className='map-btn' onClick={openMap}>
                                📃地図で見る
                            </button>

                            <button className='edit-btn' onClick={() => setIsEditing(true)}>
                                編集
                            </button>
                            {/* 
                            {modalType && (
                                <div className='modal-overlay'>
                                    <div className='modal'>
                                        <p>このカードを削除しますか？</p>

                                        <div className='modal-actions'>
                                            <button
                                                className="danger-btn"
                                                onClick={() => {
                                                    deleteShop(shop.id);
                                                    setShowDeleteModal(false);
                                                }}>
                                                削除する
                                            </button>

                                            <button
                                                className="cancel-btn"
                                                onClick={() => setShowDeleteModal(false)}>
                                                キャンセル
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )} */}
                            <button
                                className='delete-btn'
                                onClick={() => setModal({ type: "card" })}>
                                削除
                            </button>
                        </div>
                    </>
                )}
            </div>

            {modal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <p>
                            {modal.type === "card"
                                ? "このカードを削除しますか？"
                                : ""}
                        </p>

                        <div className="modal-actions">
                            <button
                                className="danger-btn"
                                onClick={() => {
                                    if (modal.type === "card") {
                                        deleteShop(shop.id);
                                    }
                                    setModal(null);
                                }}
                            >
                                削除する
                            </button>

                            <button
                                className="cancel-btn"
                                onClick={() => setModal(null)}
                            >
                                キャンセル
                            </button>
                        </div>
                    </div>

                </div>
            )}

        </>
    )

};

export default ShopItem;
