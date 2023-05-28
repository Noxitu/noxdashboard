from setuptools import find_namespace_packages, setup


setup(
    name='noxdashboard',
    version='0.2',
    packages=find_namespace_packages(where='src'),
    package_dir={'': 'src'},
    install_requires=[
        'fastapi',
        'requests',
        'psutil',
        'websockets',
        'sqlalchemy',
    ],
    python_requires='>=3.9',
)
