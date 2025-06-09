import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/App.css';

import SubjectFilter from './ProductsCatalogue/SubjectFilter'
import AuthorFilter from './ProductsCatalogue/AuthorFilter'
import AgeFilter from './ProductsCatalogue/AgeFilter'
import GradeFilter from './ProductsCatalogue/GradeFilter'
import AspectFilter from './ProductsCatalogue/AspectFilter'
import ProviderFilter from './ProductsCatalogue/ProviderFilter'
import FormatFilter from './ProductsCatalogue/FormatFilter'

import ProductCard from '../components/ProductCard'

const CourseFilter = () => {
    const [courses, setCourses] = useState([]);
    const [authors, setAuthors] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [aspects, setAspects] = useState([]);
    const [ageFilters, setAgeFilters] = useState([]);
    const [gradeFilters, setGradeFilters] = useState([]);
    const [providers, setProviders] = useState([]);
    const [formats, setFormats] = useState([]);

    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [selectedAges, setSelectedAges] = useState([]);
    const [selectedGrades, setSelectedGrades] = useState([]);
    const [selectedAspects, setSelectedAspects] = useState([]);
    const [selectedAuthors, setSelectedAuthors] = useState([]);
    const [selectedProviders, setSelectedProviders] = useState([]);
    const [selectedFormats, setSelectedFormats] = useState([]);
    
            useEffect(() => {
            const fetchData = async () => {
                try {
                    const [ courses, authors, subjects, aspects, ageFilters, gradeFilters, providers, formats ] = await Promise.all([
                        axios.get(`http://localhost:3000/api/product/courses`),
                        axios.get(`http://localhost:3000/api/product/authors`),
                        axios.get(`http://localhost:3000/api/product/subjects`),
                        axios.get(`http://localhost:3000/api/product/aspects`),
                        axios.get(`http://localhost:3000/api/product/ageFilters`),
                        axios.get(`http://localhost:3000/api/product/gradeFilters`),
                        axios.get(`http://localhost:3000/api/product/providers`),
                        axios.get(`http://localhost:3000/api/product/formats`),
                    ]);
    
                    setCourses(courses.data);
                    setAuthors(authors.data);
                    setSubjects(subjects.data);
                    setAspects(aspects.data);
                    setAgeFilters(ageFilters.data);
                    setGradeFilters(gradeFilters.data);
                    setProviders(providers.data);
                    setFormats(formats.data);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
    
            fetchData();
        }, []);

    useEffect(() => {
        // Устанавливаем данные из импортированных файлов
        setCourses(courses);
        setAuthors(authors);
        setSubjects(subjects);
        setAspects(aspects);
        setAgeFilters(ageFilters);
        setGradeFilters(gradeFilters);
        setProviders(providers);
        setFormats(formats);
    }, []);

    //Обработчики изменений по фильтрам
    const handleSubjectChange = (subjectId) => {
        setSelectedSubjects((prev) => prev.includes(subjectId) 
            ? prev.filter(id => id !== subjectId) 
            : [...prev, subjectId]);
    };
    
    const handleAgeChange = (ageId) => {
        setSelectedAges((prev) => prev.includes(ageId) 
            ? prev.filter(id => id !== ageId) 
            : [...prev, ageId]);
    };

    // Обработка изменения формата
    const handleFormatChange = (formatId) => {
        setSelectedFormats((prev) => prev.includes(formatId) 
            ? prev.filter(item => item !== formatId) 
            : [...prev, formatId]
        );
    };
     
    const handleGradeChange = (gradeId) => {
        setSelectedGrades((prev) => prev.includes(gradeId) 
            ? prev.filter(id => id !== gradeId) 
            : [...prev, gradeId]);
    };


    const handleAspectChange = (aspectId) => {
        setSelectedAspects((prev) => prev.includes(aspectId) 
            ? prev.filter(id => id !== aspectId) 
            : [...prev, aspectId]);
    };

    const handleAuthorChange = (authorId) => {
        setSelectedAuthors((prev) => prev.includes(authorId) 
            ? prev.filter(id => id !== authorId) 
            : [...prev, authorId]);
    };

    const handleProviderChange = (providerId) => {
        setSelectedProviders((prev) => prev.includes(providerId) 
            ? prev.filter(id => id !== providerId) 
            : [...prev, providerId]);
    };


    // Создаем массив отфильтрованных курсов для передачи в карточку товара
   
    const filterCourses = () => {
         // Если ни один из фильтров не выбран, итерация не происходит
        if (selectedAges.length === 0 &&
            selectedGrades.length === 0 &&
            selectedAspects.length === 0 &&
            selectedSubjects.length === 0 &&
            selectedAuthors.length === 0 &&
            selectedProviders.length === 0 &&
            selectedFormats.length === 0) {
            return courses; // Возвращаем все курсы, если фильтры не выбраны
        }
        return courses.filter(course => {
            
            // Проверка на соответствие возраста
            const matchesAge = selectedAges.length === 0 || selectedAges.some(age => {
                return age >= course.age_min && age <= course.age_max;
            });
            
            // Проверка на соответствие класса
            const matchesGrade = selectedGrades.length === 0 || selectedGrades.some(grade => {
                return grade >= course.grade_min && grade <= course.grade_max;
            });
                
            // Проверка на соответствие аспектов
            const matchesAspect = selectedAspects.length === 0 || course.Aspects.some(aspect => {
                return selectedAspects.includes(aspect.id); 
            });
    
            // Проверка на соответствие предметов
            const matchesSubject = selectedSubjects.length === 0 || course.Subjects.some(subject => {
                return selectedSubjects.includes(subject.id); 
            });
    
            // Проверка на соответствие автора
            const matchesAuthor = selectedAuthors.length === 0 || selectedAuthors.includes(course.author_id);
    
            // Проверка на соответствие поставщика
            const matchesProvider = selectedProviders.length === 0 || selectedProviders.includes(course.provider_id);
            
            // Проверка на соответствие формата
            const matchesFormat = selectedFormats.length === 0 || selectedFormats.includes(course.format_id); // Предполагается, что у курса есть поле format_id
    
            return matchesSubject && matchesAge && matchesGrade && matchesAspect && matchesAuthor && matchesProvider && matchesFormat;
        });
    };
    
    const filteredCourses = filterCourses();
    

    return (
        <div>
            <div className="container">
                <div className="row">
                    <div className="col-12">
                        <nav className="breadcrumbs">
                            <ul>
                            <li><Link className="nav-link active" aria-current="page" to="/">Главная</Link></li>
                            <li><span>Курсы</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>

            <div className="container">
            <div className="row">
                {/* Левый столбец для фильтров */}
                <div className="col-12 col-md-3">
                    <SubjectFilter subjects={subjects} onSubjectChange={handleSubjectChange} />
                    <AgeFilter ageFilters={ageFilters} onAgeChange={handleAgeChange} />
                    <FormatFilter formats={formats} onFormatChange={handleFormatChange} />
                    <AspectFilter aspects={aspects} onAspectChange={handleAspectChange} />
                    <GradeFilter gradeFilters={gradeFilters} onGradeChange={handleGradeChange} />
                    <AuthorFilter authors={authors} onAuthorChange={handleAuthorChange} />
                    <ProviderFilter providers={providers} onProviderChange={handleProviderChange} />
                </div>

                {/* Правый столбец для карточек курсов */}
                <div className="col-12 col-md-9">
                    
                        {filteredCourses.map(course => (
                            <div className="col-12 mb-3" key={course.id}>
                                <ProductCard key={course.id} course={course} />
                            </div>
                        ))}
                    
                </div>

                </div>
            </div>
        </div>
    );
};

export default CourseFilter;
