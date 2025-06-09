// src/hooks/useLinkWarning.js
// хук для показа предупреждения о переходе по внешней ссылке

import { useState, useCallback } from 'react';
import { domToReact } from 'html-react-parser'; // Важно импортировать
// Убедитесь, что путь к вашей утилите convertTextToLinks правильный
import { convertTextToLinks } from '../utils/textUtils';

export const useLinkWarning = () => {
    const [warningVisible, setWarningVisible] = useState(false);
    const [clickedUrl, setClickedUrl] = useState('');

    const handleLinkClick = useCallback((url, event) => {
        if (event) event.preventDefault(); // Предотвращаем переход, если событие есть

         // Добавляем http для анкорных ссылок вида www.example.com, иначе браузер думает, что это относительный путь и рендерит пустую страницу нашего сайта
        let correctedUrl = url;
        if (!/^((http|https|ftp):\/\/)/i.test(url)) {
            correctedUrl = `http://${url}`; // По умолчанию добавляем http://
        }

        setClickedUrl(url);
        setWarningVisible(true);
    }, []); // useCallback, т.к. эта функция будет передаваться в options

    const handleCloseWarning = useCallback(() => {
        setWarningVisible(false);
        setClickedUrl('');
    }, []);

    const handleConfirmNavigation = useCallback(() => {
        if (clickedUrl) {
            window.open(clickedUrl, '_blank', 'noopener,noreferrer');
            setWarningVisible(false);
            setClickedUrl('');
        }
    }, [clickedUrl]); // Зависимость от clickedUrl

    // Используем useCallback для getParserOptions, чтобы ссылка на функцию была стабильной,
    // если она передается как проп или используется в зависимостях других хуков.
    // Также это гарантирует, что handleLinkClick внутри options всегда будет актуальной версией.
    const getParserOptions = useCallback(() => {
        // Важно, чтобы parserOptions определялись внутри getParserOptions
        // чтобы ссылка на handleLinkClick была свежей и замыкание было правильным
        // для рекурсивных вызовов domToReact.
        const parserOptions = {
            replace: (domNode) => {
                if (domNode.type === 'text' && domNode.data && domNode.data.trim() !== '') {
                    // Важно: convertTextToLinks тоже должен добавлять схему!
                    // (об этом ниже)
                    const processedText = convertTextToLinks(domNode.data, (originalUrl, event) => {
                        // Здесь originalUrl уже должен быть скорректирован в convertTextToLinks
                        handleLinkClick(originalUrl, event);
                    });
                    return <>{processedText}</>;
                }


                if (domNode.name === 'a' && domNode.attribs && domNode.attribs.href) {
                    let href = domNode.attribs.href;
                    const { onClick, href: _originalHref, ...otherAttribs } = domNode.attribs;

                    // Корректируем href ПЕРЕД передачей в handleLinkClick
                    let correctedHref = href;
                    if (href && !/^((http|https|ftp):\/\/)/i.test(href)) {
                        correctedHref = `http://${href}`;
                    }


                    return (
                            <a
                            {...otherAttribs}
                            // ВАЖНО: для атрибута href можно оставить оригинальное значение,
                            // если вы хотите, чтобы HTML оставался "как ввел пользователь",
                            // а исправление происходило только при клике.
                            // Либо можно сразу писать correctedHref:
                            href={correctedHref} // Или href={href} если исправлять только при клике
                            onClick={(e) => handleLinkClick(correctedHref, e)} // Передаем исправленный URL
                        >
                            {/* ВАЖНО: передаем parserOptions рекурсивно */}
                            {domNode.children && domNode.children.length > 0 ? domToReact(domNode.children, parserOptions) : null}
                        </a>
                    );
                }
                // Для других узлов не делаем ничего, html-react-parser обработает их по умолчанию
            }
        };
        return parserOptions;
    }, [handleLinkClick]); // Зависимость от handleLinkClick

    // Опционально: можно вернуть и JSX для самого диалога
    const LinkWarningDialog = useCallback(({ visible, url, onConfirm, onClose }) => {
        if (!visible) return null;
        return (
            <div className="alert alert-warning"> {/* Используйте ваши классы */}
                <p>Вы собираетесь перейти по внешней ссылке: <strong>{url}</strong></p>
                <button onClick={onConfirm} className="btn btn-primary">Перейти</button>
                <button onClick={onClose} className="btn btn-secondary">Отмена</button>
            </div>
        );
    }, []);


    return {
        warningVisible,
        clickedUrl,
        // handleLinkClick можно не экспортировать, если он используется только внутри getParserOptions
        handleCloseWarning,
        handleConfirmNavigation,
        getParserOptions, // Функция, возвращающая объект options
        LinkWarningDialog   // Компонент диалогового окна
    };
};
