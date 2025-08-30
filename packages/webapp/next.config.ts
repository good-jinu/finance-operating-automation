import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // 모노레포 내의 @finance-operating-automation/core 패키지를 Next.js가 인식하고 처리하도록 설정합니다.
    transpilePackages: ['@finance-operating-automation/core'],

    webpack: (config, { isServer }) => {
        // 서버 측 빌드에서만 better-sqlite3를 외부 모듈로 처리합니다.
        // 클라이언트 측 코드에는 포함될 수 없으므로 isServer 체크가 중요합니다.
        if (isServer) {
            config.externals.push('better-sqlite3');
        }

        // 수정된 config 객체를 반환합니다.
        return config;
    },
};

export default nextConfig;
