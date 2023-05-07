export default function Layout({children, actions}: {children: React.ReactNode, actions: React.ReactNode}) {
    return (
        <>
            {children}
            {actions}
        </>
    );
}