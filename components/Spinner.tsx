export const Spinner = ({size = 32}) => {
    return (
        <svg width={size} height={size} viewBox="0 0 337 337" fill="none" xmlns="http://www.w3.org/2000/svg" className={"animate-spin"}>
            <path d="M169 336.999C168.833 337 168.667 337 168.5 337C75.4399 337 0 261.56 0 168.5C0 75.4399 75.4399 0 168.5 0C261.56 0 337 75.4399 337 168.5C337 168.667 337 168.833 336.999 169H298C298 97.7554 240.245 40 169 40C97.7554 40 40 97.7554 40 169C40 240.245 97.7554 298 169 298V336.999Z" fill="currentColor" />
        </svg>
    );
};