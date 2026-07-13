import { Link } from 'react-router';

interface ErrorProps {
    message: string;
    action?: {
        to: string;
        label: string;
    };
}

function Error({ message, action }: ErrorProps) {
    return (
        <div>
            <div className="rounded-box border border-base-300 bg-base-100 p-8 text-center" role="alert">
                <p className="text-base-content/70">{message}</p>
                {action ? (
                    <Link to={action.to} className="btn btn-primary btn-sm mt-4">
                        {action.label}
                    </Link>
                ) : null}
            </div>
        </div>
    )
}

export default Error
