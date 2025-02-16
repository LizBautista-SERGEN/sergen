
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gauge, Check } from "lucide-react";

const ServiceDemanda = () => {
  const navigate = useNavigate();

  const benefits = [
    "Reducción de hasta un 50% en la factura eléctrica",
    "Optimización del consumo energético",
    "Planes operativos personalizados"
  ];

  const process = [
    "Análisis de patrones de consumo",
    "Diseño de un plan de gestión de demanda",
    "Acceso a plataforma y monitoreo continuo"