/**
 * Utility to safely join API base URL with endpoint path.
 * Ensures single slash between base and path, and optional trailing slash.
 * 
 * Usage:
 * joinApiUrl(environment.apiUrl, 'socios') -> 'https://.../api/v1/socios/'
 */
export function joinApiUrl(baseUrl: string, path: string, ensureTrailingSlash: boolean = true): string {
    // 1. Remove trailing slash from base
    const cleanBase = baseUrl.replace(/\/+$/, '');

    // 2. Remove leading/trailing slash from path
    const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');

    // 3. Join with single slash
    let result = `${cleanBase}/${cleanPath}`;

    // 4. Append trailing slash if requested (DRF standard)
    if (ensureTrailingSlash) {
        result += '/';
    }

    return result;
}
