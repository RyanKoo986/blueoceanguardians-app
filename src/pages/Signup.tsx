import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Helmet } from 'react-helmet-async';

const Signup = () => {
  const [formData, setFormData] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    name: '',
    birthDate: '',
    address: '',
    phone: '',
    email: '',
    affiliation: '',
    licenseGrade: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validate = () => {
    // ID/PW: 영문+숫자 5자 이상 (특수문자 제외)
    const credRegex = /^[a-zA-Z0-9]{5,}$/;
    if (!credRegex.test(formData.id)) {
      return '아이디는 영문/숫자 5자 이상이어야 합니다.';
    }
    if (!credRegex.test(formData.password)) {
      return '비밀번호는 영문/숫자 5자 이상이어야 합니다.';
    }
    if (formData.password !== formData.confirmPassword) {
      return '비밀번호가 일치하지 않습니다.';
    }

    if (!formData.name.trim()) return '이름을 입력해주세요.';
    if (!formData.birthDate) return '생년월일을 입력해주세요.';
    if (!formData.address.trim()) return '집주소를 입력해주세요.';
    if (!formData.phone.trim()) return '휴대폰번호를 입력해주세요.';
    if (!formData.email.trim()) return '이메일을 입력해주세요.';
    if (!formData.affiliation.trim()) return '소속단체를 입력해주세요.';
    if (!formData.licenseGrade.trim()) return '최종 라이센스 등급을 입력해주세요.';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await signup({
        id: formData.id,
        password: formData.password,
        name: formData.name.trim(),
        birthDate: formData.birthDate,
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        affiliation: formData.affiliation.trim(),
        licenseGrade: formData.licenseGrade.trim()
      });
      alert('회원가입이 완료되었습니다.');
      navigate('/');
    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClass = "block text-sm font-bold text-gray-700 md:text-right";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-[80px]">
      <Helmet>
        <title>회원가입 - Blue Guardians</title>
      </Helmet>

      <div className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-xl shadow-sm border border-gray-200">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 border-b border-gray-200 pb-6 mb-8">
              회원가입
            </h2>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* ID */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-6">
                <label htmlFor="id" className={labelClass}>
                  아이디 <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3">
                  <input
                    id="id"
                    name="id"
                    type="text"
                    required
                    className={inputClass}
                    placeholder="영문/숫자 5자 이상"
                    value={formData.id}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-6">
                <label htmlFor="password" className={labelClass}>
                  비밀번호 <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3 relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className={`${inputClass} pr-10`}
                    placeholder="영문/숫자 5자 이상"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-6">
                <label htmlFor="confirmPassword" className={labelClass}>
                  비밀번호 확인 <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    className={inputClass}
                    placeholder="비밀번호 재입력"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Name */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-6">
                <label htmlFor="name" className={labelClass}>
                  이름 <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className={inputClass}
                    placeholder="이름"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Birth Date */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-6">
                <label htmlFor="birthDate" className={labelClass}>
                  생년월일 <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3">
                  <input
                    id="birthDate"
                    name="birthDate"
                    type="date"
                    required
                    className={inputClass}
                    value={formData.birthDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-6">
                <label htmlFor="address" className={labelClass}>
                  집주소 <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3">
                  <input
                    id="address"
                    name="address"
                    type="text"
                    required
                    className={inputClass}
                    placeholder="예: 서울특별시 강남구 테헤란로 123"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-6">
                <label htmlFor="phone" className={labelClass}>
                  휴대폰번호 <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className={inputClass}
                    placeholder="010-1234-5678"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-6">
                <label htmlFor="email" className={labelClass}>
                  이메일 <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className={inputClass}
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Affiliation */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-6">
                <label htmlFor="affiliation" className={labelClass}>
                  소속단체 <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3">
                  <input
                    id="affiliation"
                    name="affiliation"
                    type="text"
                    required
                    className={inputClass}
                    placeholder="예: 대한잠수협회"
                    value={formData.affiliation}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* License Grade */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b border-gray-100 pb-6">
                <label htmlFor="licenseGrade" className={labelClass}>
                  최종 라이센스 등급 <span className="text-red-500">*</span>
                </label>
                <div className="col-span-3">
                  <input
                    id="licenseGrade"
                    name="licenseGrade"
                    type="text"
                    required
                    className={inputClass}
                    placeholder="예: Open Water, Advanced, Rescue, Divemaster"
                    value={formData.licenseGrade}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 px-4 py-2 rounded-md border border-red-100">
                {error}
              </div>
            )}

            <div className="pt-4 flex justify-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-32 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-32 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition-colors"
              >
                {loading ? '처리중...' : '가입하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
