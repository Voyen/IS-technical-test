FROM public.ecr.aws/docker/library/python:3.10

WORKDIR /app
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "main.py"]
